
const initModels = require('../models');
const LessonTypes = require('../models/LessonTypes');
const express = require('express');
const aws = require('aws-sdk');
const stream = require('stream');
const multer = require('multer');
const multerS3 = require('multer-s3');
const HttpStatus = require('http-status-codes');
const asyncMiddleware = require('../middleware/asyncMiddleware');
const debug = require('debug')('manabu:controllers');
const fs = require('fs');
const showdown = require('showdown');
const markdownConverter = new showdown.Converter();
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const {
  updateProfileUrl,
} = require('../services/userService');
const {
  getCoursesWithLessons,
  findUserAndCompletedCoursesFromDb,
  findCoursesWithUserProgress,
  findCourseByAuthor,
  findCoursesByTag,
  findCourseWithTittle,
  getTitlesTagsAndAuthorsOfCourses,
  twoDigitFormat,
  findAllCourses,
  getRecommendedCourses,
  selectOneRandomCourse,
  getTitlesOfCourses,
  createMapOfCourseIdAndTitle,
  createMapOfFirstLessonIdAndCourseTitle,
  userCompletedThisCourse,
  getFavouriteCourses,
} = require('../services/courseService');

const {
  continueWhereILeftOff,
  getLatestCourse,
} = require('../services/lessonService');

const router = express.Router();

router.get('/home', asyncMiddleware(async (req, res) => {
  const titles_tags_and_authors = await getTitlesTagsAndAuthorsOfCourses();
  const titles_of_courses = await getTitlesOfCourses();
  const completedCourses = await findUserAndCompletedCoursesFromDb(req.user.id);
  const coursesStillInProgress = await findCoursesWithUserProgress(req.user.id);
  const courses = await findAllCourses(req.user);
  const recommendedCourses = await getRecommendedCourses(req.user.id);
  const random_course = await selectOneRandomCourse();
  const mapOfCourseIdAndTitle = await createMapOfCourseIdAndTitle();
  const mapOfFirstLessonIdAndCourseTitle = await createMapOfFirstLessonIdAndCourseTitle();
  const dataActionForSidebar = 'click->homecontroller#toggleSidebar';
  const dataActionForToolTipAppearing = 'mouseover->homecontroller#showTooltip(this)';
  const dataActionForToolTipDisappearing = 'mouseout->homecontroller#hideTooltip(this)';
  const favouriteCourses = await getFavouriteCourses(req.user.id);
  const breadcrumbs = [{
    href: '#',
    linkName: 'Home',
  }];
  res.render('home', {
    titles_tags_and_authors,
    courses,
    breadcrumbs,
    dataActionForSidebar,
    dataActionForToolTipAppearing,
    dataActionForToolTipDisappearing,
    currentUrl: req.path,
    role: req.role,
    user: req.user,
    completedCourses,
    numberOfCompletedCourses: twoDigitFormat(completedCourses.length),
    recommended_courses: recommendedCourses,
    numberOfCoursesStillInProgress: twoDigitFormat(coursesStillInProgress.length),
    random_course,
    titles_of_courses,
    map_of_course_id_and_title: mapOfCourseIdAndTitle,
    map_of_first_lesson_id_and_course_title: mapOfFirstLessonIdAndCourseTitle,
    favouriteCourses,
  });
}));

router.get('/getFavouriteCourses', asyncMiddleware(async (req,res) => {
  const favouriteCourses = await getFavouriteCourses(req.user.id);
  return res.status(HttpStatus.OK).send(favouriteCourses);
}));

router.get('/continueWhereILeftOff', asyncMiddleware(async (req, res) => {
  const getContinueWhereILeftOff = await continueWhereILeftOff(req.user);
  return res.status(HttpStatus.OK).send(getContinueWhereILeftOff);
}));

router.get('/getLatestCourse', asyncMiddleware(async (req, res) => {
  const foundLatestCourse = await getLatestCourse();
  return res.status(HttpStatus.OK).send(foundLatestCourse);
}));

router.post('/editPresentation/:title', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  await Presentation.update({ title: req.params.title })
    .set({
      title: req.body.title,
      transitionType: req.body.transitionType,
      theme: req.body.theme
    });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/search/:search', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Tag = models.getModel('tag');
  const Author = models.getModel('user');
  const tag = await Tag.find({ label: req.params.search });
  const author = await Author.find({ name: req.params.search });

  const breadcrumbs = [{
    href: '/',
    linkName: 'courses'
  }, {
    href: '#',
    linkName: 'Search'
  }];

  if (tag[0]) {
    const searchedByTag = await findCoursesByTag(req.user, tag[0].id);
    return res.render('courses/list', {
      courses: searchedByTag,
      breadcrumbs,
      role: req.role
    })
  } else if (author[0]) {
    const searchByAuthor = await findCourseByAuthor(req.user, author[0].id);
    return res.render('courses/list', {
      courses: searchByAuthor,
      breadcrumbs,
      role: req.role
    })
  }
  const searchByTitle = await findCourseWithTittle(req.user, req.params.search);
  if (searchByTitle[0]) {
    return res.render('courses/list', {
      courses: searchByTitle,
      breadcrumbs,
      role: req.role
    })
  } else {
    res.render('profile/errorPage', {
      breadcrumbs,
      role: req.role
    });
  }
}));

router.delete('/presentations/delete/:title', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  await Presentation.destroy({ title: req.params.title });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/uploadPresentation/:lesson/:theme/:transition', asyncMiddleware(async (req, res) => {
  const lessonTitle = req.params.lesson;
  const slide = req.params.slide;
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const presentation = await Presentation.find({ title: req.params.lesson, createdBy: 'user' });
  const breadcrumbs = [{
    href: '/presentations',
    linkName: 'Presentations'
  }, {
    href: `#`,
    linkName: 'Upload presentation'
  }];
  slides = presentation[0].slides;
  const urllocation = "index";
  res.render('uploadPresentation', {
    lessonTitle,
    slidedata: slides,
    slide,
    breadcrumbs,
    presentationTheme: req.params.theme,
    presentationTransition: req.params.transition,
    role: req.role,
    role: req.role,
    urllocation
  });
}));

router.get('/presentations', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const presentation = models.getModel('presentation');

  presentations = await presentation.find({ author: req.user.name, createdBy: 'user' });
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }, {
    href: '#',
    linkName: 'Presentations'
  }];
  res.render('presentations', {
    author: req.user.name,
    presentations,
    breadcrumbs,
    role: req.role
  });
}));

router.post('/presentations', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const presentation = models.getModel('presentation');

  let fileContent = fs.readFileSync('./public/files/defaultMarkdown.txt', 'utf8');

  await presentation.create({
    title: req.body.title,
    slides: fileContent,
    author: req.user.name,
    createdBy: 'user',
    transitionType: req.body.transitionType,
    theme: req.body.theme
  }).fetch();

  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/revealHelpGuide', asyncMiddleware(async (req, res) => {
  var contents = fs.readFileSync('public/markdown/RevealHelpGuide.md', 'utf8');
  const markdown = markdownConverter.makeHtml(contents);

  res.render('revealHelpGuide', {
    revealHelpGuide: markdown,
    role: req.role
  })
}));

router.get('/reveal/:id', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const presentation = await Presentation.find({ id: req.params.id}).limit(1);
  res.render('reveal', {
    slides: presentation[0].slides,
    transitionType: presentation[0].transitionType,
    theme: presentation[0].theme
  });
}));

router.get('/reveal/:title/preview', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const presentation = await Presentation.find({ title: req.params.title, createdBy: 'preview' }).limit(1);
  slides = presentation[0].slides;
  res.render('reveal', {
    slides,
    transitionType: presentation[0].transitionType,
    theme: presentation[0].theme,
  });
}));

router.get('/addCourse', (req, res) => {
  res.render('addCourse');
});
router.get('/errorPage', (req, res) => {
  res.render('views/errorPage');
});

router.get('/errorPage', (req, res) => {
  res.render('admin/errorPage');
});


router.post('/addCourse', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');

  await Course.create({
    title: req.body.title,
    image: '149373.svg',
    description: req.body.description
  }).fetch();

  res.redirect('/');

}));

router.get('/editCourse', (req, res) => {
  res.render('editCourse');
});
router.get('/sendEmail', (req, res) => {
  res.render('profile/send-email');
});

router.post('/editCourse', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');

  await Course.update({ title: req.body.title })
    .set({
      title: req.body.titleUpdate,
      image: '149373.svg',
      description: req.body.descriptionUpdate
    });

  res.redirect('/');
}));

router.get('/courses/home', (req, res) => {
  res.redirect('/courses');
});

router.get('/', (req, res) => {
  if (req.role == 'admin') {
    res.redirect('/admin/home');
  }
  else {
    res.redirect('/home');
  }
});

router.post('/uploadPresentation/:title', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');

  await Presentation.update({ title: req.params.title })
    .set({
      slides: req.body.markdown,
    });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/uploadTempPresentation/:title', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const presentations = await Presentation.find({ title: req.params.title, createdBy: 'preview' });

  if (!presentations[0]) {
    await Presentation.create({
      title: req.params.title,
      createdBy: 'preview',
      theme: req.body.presentationTheme,
      transitionType: req.body.presentationTransition,
      author: req.user.name,
    });
  }

  await Presentation.update({ title: req.params.lesson, createdBy: 'preview' })
    .set({
      slides: req.body.markdown,
    });

  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/profile', asyncMiddleware(async (req, res) => {
  const user = req.user;
  const userAndCompletedCourses = await findUserAndCompletedCoursesFromDb(user.id);
  const coursesWithUserProgress = await findCoursesWithUserProgress(user.name);
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }, {
    href: '#',
    linkName: 'Profile'
  }];

  res.render('profile/index', {
    heading: 'Your profile',
    email: user.email,
    name: user.name,
    surname: user.surname,
    image: user.image,
    abNumber: user.preferred_username,
    userAndCompletedCourses,
    coursesWithUserProgress,
    breadcrumbs,
    role: req.role
  });
}));

router.post('/profile', (req, res, next) => {
  const s3 = new aws.S3();

  const storage = multerS3({
    s3,
    bucket: 'manabu',
    key: (multerReq, file, cb) => {
      cb(null, `${req.user.id}.jpg`);
    },
  });

  const uploadMulter = multer({ storage: storage });

  uploadMulter.single('file')(req, res, async (err) => {
    if (err) {
      debug('Error while uploading file', err);
      return next(err);
    }

    await updateProfileUrl(req.user.id, req.file.location);
    return res.status(HttpStatus.OK).send({ success: true });
  });
});

router.get('/webhooks', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  const courses = await Course.find();

  const webhookModel = await initModels();
  const WebhookEmail = webhookModel.getModel('webhookemail');
  const webhookemails = await WebhookEmail.find();

  const user = req.user;
  const breadcrumbs = [{
    href: `/admin/index`,
    linkName: 'Manage Courses'
  }, {
    href: '#',
    linkName: 'Webhooks'
  }];
  res.render('webhooks', {
    email: user.email,
    courses,
    breadcrumbs,
    role: req.role,
    webhookemails,
  });
}));

router.post('/webhooks/email', asyncMiddleware(async (req, res) => {

  const models = await initModels();
  const WebhookEmail = models.getModel('webhookemail');
  await WebhookEmail.create({
    email: req.body.email,
    course: req.body.course,
    completion: req.body.completion,
  }).fetch();
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/courses/:courseId/lessons/:lessonId/createTrueOrFalseQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const TrueOrFalseQuestion = models.getModel('trueorfalsequestion');
  const Lesson = models.getModel('lesson');
  const courseId = await req.params.courseId;
  const lessonId = await req.params.lessonId;
  const newTrueOrFalseQuestion = await TrueOrFalseQuestion.create({
    statement: req.body.statement,
    answer: req.body.answer,
    courseId: courseId,
    lessonId: lessonId,
  }).fetch();
  await Lesson.addToCollection(lessonId, 'trueOrFalseQuestions', newTrueOrFalseQuestion.id);
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.put('/courses/:courseId/lessons/:lessonId/editTrueOrFalseQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const TrueOrFalseQuestion = models.getModel('trueorfalsequestion');
  const courseId = await req.params.courseId;
  const lessonId = await req.params.lessonId;
  await TrueOrFalseQuestion.update({
    courseId: courseId,
    lessonId: lessonId,
  }).set({
    statement: req.body.statement,
    answer: req.body.answer,
  }).fetch();
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/courses/:courseId/lessons/:lessonId/createMultipleChoiceQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const MultipleChoiceQuestion = models.getModel('multiplechoicequestion');
  const Lesson = models.getModel('lesson');
  const courseId = await req.params.courseId;
  const lessonId = await req.params.lessonId;
  const newMultipleChoiceQuestion = await MultipleChoiceQuestion.create({
    question: req.body.question,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    answer: req.body.answer,
    courseId: courseId,
    lessonId: lessonId,
  }).fetch();
  await Lesson.addToCollection(lessonId, 'multipleChoiceQuestions', newMultipleChoiceQuestion.id);
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/courses/:courseId/lessons/:lessonId/answerTrueOrFalseQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const TrueOrFalseQuestion = await models.getModel('trueorfalsequestion');
  const trueOrFalseQuestion = await TrueOrFalseQuestion.find({
    courseId: req.params.courseId,
    lessonId: req.params.lessonId,
  }).limit(1);
  await res.render('courses/true-or-false-question', {
    statement: trueOrFalseQuestion[0].statement,
    answer: trueOrFalseQuestion[0].answer,
  });
}));

router.get('/courses/:courseId/lessons/:lessonId/answerMultipleChoiceQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const MultipleChoiceQuestion = await models.getModel('multiplechoicequestion');
  const multipleChoiceQuestion = await MultipleChoiceQuestion.find({
    courseId: req.params.courseId,
    lessonId: req.params.lessonId,
  }).limit(1);
  const breadcrumbs = [{
    href: '#',
    linkName: 'Multiple Choice Question',
  }];
  await res.render('courses/multiple-choice-question', {
    question: multipleChoiceQuestion[0].question,
    option1: multipleChoiceQuestion[0].option1,
    option2: multipleChoiceQuestion[0].option2,
    option3: multipleChoiceQuestion[0].option3,
    option4: multipleChoiceQuestion[0].option4,
    answer: multipleChoiceQuestion[0].answer,
    breadcrumbs,
  });
}));

router.post('/rateCourse/:courseId/:userId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Rating = models.getModel('rating');
  const courseId = await req.params.courseId;
  const userId = await req.params.userId;
  const userRatingForCourse = await Rating.findOne({
    courseId: courseId,
    userId: userId,
  });
  if (!userRatingForCourse || userRatingForCourse === undefined) {
    await Rating.create({
      courseId: courseId,
      courseTitle: req.body.courseTitle,
      userId: userId,
      userName: req.body.userName,
      userSurname: req.body.userSurname,
      userRating: req.body.userRating,
      userComment: req.body.userComment,
    }).fetch();
  } else {
    await Rating.update({
      courseId: courseId,
      userId: userId,
    }).set({
      courseTitle: req.body.courseTitle,
      userName: req.body.userName,
      userSurname: req.body.userSurname,
      userRating: req.body.userRating,
      userComment: req.body.userComment,
    }).fetch();
  }
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.put('/averageCourseRating/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Rating = models.getModel('rating');
  const Course = models.getModel('course');
  const courseId = await req.params.courseId;
  const ratingsForCourse = await Rating.find({ courseId: courseId });
  let totalRatings = 0;
  let averageRating = 0;
  const numberOfRatings = ratingsForCourse.length;
  ratingsForCourse.forEach((rating) => {
    totalRatings += rating.userRating;
  });
  if (numberOfRatings > 0) {
    averageRating = totalRatings / numberOfRatings;
    await Course.update({ id: courseId }).set({ rating: averageRating }).fetch();
  }
  return res.status(HttpStatus.OK).send({ success: true });
}));

module.exports = router;
