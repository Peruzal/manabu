const express = require('express');
const asyncMiddleware = require('../middleware/asyncMiddleware');
const initModels = require('../models');
const showdown = require('showdown');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const path = require('path');
const multer = require('multer');
const aws = require('aws-sdk');
const https = require('https');
const multerS3 = require('multer-s3');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
const {
  findAllCourses,
  findOneCourse,
  findCourseByAuthor,
  findCoursesByTag,
  findUsersAndTheirCompletedCourses,
  findUsersWithProgress,
  findCourseByTitle,
  addTagToCourse,
  addAuthorToCourse,
  assignAuthorToCourse,
  findCourseWithTittle,
  twoDigitFormat,
  getNumberOfFavouriteCourses,
  getNumberOfPeopleWhoCompletedCoursesForEveryCourse,
  mapOfNumberOfPeopleWatchingACourse,
  getYValuesForQuickStatsGraph,
  getMostPopularCoursesOfAuthor,
  getActiveCoursesAuthoredByUser,
  getArchivedCoursesByUser,
  findUsersThatCompletedAuthoredCourses,
  courseStatisticsForAuthor,
  updateCourseWhenLessonIsEdited,
  getMostRecentCoursesByAuthor,
  getAllUsersWatchingThisCourse,
  getAllUsersWhoCompletedThisCourse,
  getAllUsersAssociatedWithThisCourse,
} = require('../services/courseService');
const {
  updateLessonMarkdown,
  deleteLesson,
  moveLesson,
  updateLessonUrl,
  updateImageUrl,
  getPreviousLessonOrderNumber,
  addLessonWithOnlyAuthor,
  getPresentationAuthoredByUser
} = require('../services/lessonService');
const markdownConverter = new showdown.Converter();

router.get('/home', asyncMiddleware(async (req, res) => {
  const coursesAuthoredByUser = await getActiveCoursesAuthoredByUser(req.user.id);
  const archivedCoursesByUser = await getArchivedCoursesByUser(req.user.id);
  const dataActionForSidebar = 'click->adminhomecontroller#toggleSidebar';
  const breadcrumbs = [{
    href: '#',
    linkName: 'Admin',
  }];

  res.render('admin-home', {
    breadcrumbs,
    dataActionForSidebar,
    coursesAuthoredByUser,
    archivedCoursesByUser,
    role: req.role,
    user: req.user,
  });
}));

router.get('/profile', asyncMiddleware(async (req, res) => {
  const user = req.user;
  const courseStats = await courseStatisticsForAuthor(req.user.id);
  const numberOfPeopleWhoAreWatchingCoursesByThisAuthor = courseStats.inProgress;
  const numberOfPeopleWhoAreWatchingCoursesByThisAuthorInTwoDigitFormat = twoDigitFormat(numberOfPeopleWhoAreWatchingCoursesByThisAuthor);
  const numberOfPeopleWhoCompletedCoursesByThisAuthor = courseStats.completed;
  const numberOfPeopleWhoCompletedCoursesByThisAuthorInTwoDigitFormat = twoDigitFormat(numberOfPeopleWhoCompletedCoursesByThisAuthor);
  const numberOfFavouriteCoursesForAuthor = twoDigitFormat(await getNumberOfFavouriteCourses(req.user.id));
  return res.status(HttpStatus.OK).send({
    user,
    numberOfPeopleWhoAreWatchingCoursesByThisAuthor,
    numberOfPeopleWhoAreWatchingCoursesByThisAuthorInTwoDigitFormat,
    numberOfPeopleWhoCompletedCoursesByThisAuthorInTwoDigitFormat,
    numberOfFavouriteCoursesForAuthor
  });
}));

router.get('/quickStats', asyncMiddleware(async (req,res) => {
  const numberOfPeopleWhoCompletedCoursesForEveryCourse = await getNumberOfPeopleWhoCompletedCoursesForEveryCourse();
  const mapOfAmountOfPeopleWatchingACourse = await mapOfNumberOfPeopleWatchingACourse();
  const listOfYValues = await getYValuesForQuickStatsGraph();
  const maximumYValue = listOfYValues[listOfYValues.length - 1];
  const mostRecentCoursesOfAuthor = await getMostRecentCoursesByAuthor(req.user.id, 5);

  return res.status(HttpStatus.OK).send({
    mapOfAmountOfPeopleWatchingACourse,
    numberOfPeopleWhoCompletedCoursesForEveryCourse,
    mostRecentCoursesOfAuthor,
    listOfYValues,
    maximumYValue,
  });
}));

router.post('/presentation', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const foundPresentation = await Presentation.find({ title: req.body.title });
  switch (foundPresentation.length) {
    case 1:
      return res.status(HttpStatus.OK).send({
        presentationTitleExists: true
      });
    default:
      const createdPresentation = await Presentation.create({
        title: req.body.title,
        transitionType: req.body.transitionType,
        theme: req.body.theme,
        userId: req.user.id,
      }).fetch();
      const lesson = {
        title: req.body.title,
        type: 'PRESENTATION',
        source: '/reveal/'+createdPresentation.id,
        course: req.body.courseId,
        durationInSeconds: '0',
        markdown:'',
        category: ''
      }
      const createdLesson = await addLessonWithOnlyAuthor(lesson, req.user);
      return res.status(HttpStatus.OK).send({
        lesson: createdLesson,
        presentation: createdPresentation,
        presentationTitleExists: false
      });
  }
}));

router.get('/presentations', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const foundPresentations = await Presentation.find({ userId: req.user.id });
  return res.status(HttpStatus.OK).send({
    presentations: foundPresentations
  });
}));

router.get('/editPresentation/:presentationId', asyncMiddleware(async (req, res) => {
  const foundPresentation = await getPresentationAuthoredByUser(req.params.presentationId);
  res.render('presentation', {
    presentation: foundPresentation[0]
  });
}));

router.put('/editPresentation', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');

  const Editedcourse = await Presentation.update({ id: req.body.presentationId}).set({
      title: req.body.title,
      theme: req.body.theme,
      transitionType: req.body.transition,
      slides: req.body.slides,
  }).fetch();

  return res.status(HttpStatus.OK).send(Editedcourse);
}));

router.get('/presentation/:presentationId', asyncMiddleware(async(req, res) => {
  const foundPresentations = await getPresentationAuthoredByUser(req.params.presentationId);
  return res.status(HttpStatus.OK).send(foundPresentations[0]);
}));

router.get('/courseIconsBasedOnChosenCategories/:category', asyncMiddleware(async (req,res) => {
  const models = await initModels();
  const ImageForCourse = models.getModel('imageforcourse');
  const courseIconsBasedOnChosenCategories = await ImageForCourse.find({ category: req.params.category });

  return res.status(HttpStatus.OK).send(courseIconsBasedOnChosenCategories);
  
}));


router.post('/lessonTitle', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Lesson = models.getModel('lesson');
  const searchedLesson = await Lesson.find({ title: req.body.title, course: req.body.course });

  if (!searchedLesson[0]) {
    const lesson = {
      title: req.body.title,
      type: '',
      source: '',
      course: req.body.course,
      durationInSeconds: 0,
      order: 0,
      markdown: '',
      category: '',
    };
    await addLessonWithOnlyAuthor(lesson, req.user);
    return res.status(HttpStatus.OK).send({ lessonAlreadyExists: false });
  }
  return res.status(HttpStatus.OK).send({ lessonAlreadyExists: true });
}));

router.get('/usersThatCompletedAuthoredCourses', asyncMiddleware(async (req, res) => {
  const usersThatCompletedAuthoredCourses = await findUsersThatCompletedAuthoredCourses(req.user.id);
  return res.status(HttpStatus.OK).send(usersThatCompletedAuthoredCourses);
}));

router.put('/orderlessons', asyncMiddleware(async (req, res) => {
  let lessonBeingMoved = req.body.lessonBeingMoved;
  let orderedLessons = req.body.orderedlessons;
  const models = await initModels();
  const Lesson = models.getModel('lesson');
  let newLessonOrderNumber = 0;
  for(let counter = 0; counter < orderedLessons.length; counter++) {
    if(orderedLessons[counter].course == lessonBeingMoved.course) {
      await Lesson.update({ id: orderedLessons[counter].id })
      .set({
        order: newLessonOrderNumber++,
      });
    }
  }
  return res.status(HttpStatus.OK).send(req.body);
}));

router.get('/userDetailsForCourse/:courseTitle', asyncMiddleware(async (req, res) => {
  const courseTitle = await req.params.courseTitle;
  const usersAssociatedWithCourse = await getAllUsersAssociatedWithThisCourse(courseTitle);
  return res.status(HttpStatus.OK).send(usersAssociatedWithCourse);
}));


router.delete('/deleteTag/:tagId/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const course_tags__tag_courses = await models.getModel('course_tags__tag_courses').find({
    course_tags: req.params.courseId,
    tag_courses: req.params.tagId,
  });

  await models.getModel('tag').destroy({ id: course_tags__tag_courses[0].tag_courses });

  return res.status(HttpStatus.OK).send({ message: `Tag with label ${req.body.label} deleted successfully.` });
}));

router.post('/addTagToCourse/:courseId', asyncMiddleware(async (req, res) => {
  await addTagToCourse(req.body.tag, req.params.courseId);
  return res.status(HttpStatus.OK).send({ message: `Tag with label ${req.body.tag} added successfully.` });
}));

router.delete('/deleteAuthor/:authorId/:courseId/:lessonId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const author = await models.getModel('user').find({
    id: req.params.authorId,
  });
  const deleteMessage = author[0].name + ' ' + author[0].surname + ' has been removed successfully.';
  const CourseAndAuthor = await models.getModel('course_authors__user_courses');
  await CourseAndAuthor.destroy({
    course_authors: req.params.courseId,
    user_courses: req.params.authorId,
  });
  const LessonAndAuthor = await models.getModel('lesson_authors__user_lessons');
  await LessonAndAuthor.destroy({
    lesson_authors: req.params.lessonId,
    user_lessons: req.params.authorId,
  });
  return res.status(HttpStatus.OK).send(deleteMessage);
}));

router.post('/addAuthorToCourse/:courseId/:lessonId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const courseId = await req.params.courseId;
  const lessonId = await req.params.lessonId;
  const author = await models.getModel('user').find({
    email: req.body.email,
  });
  if (!author[0] || author[0] === undefined) {
    return res.status(HttpStatus.OK).send({ authorAddedSuccessfully: false });
  }
  const Course = models.getModel('course');
  await Course.addToCollection(courseId, 'authors', author[0].id);
  const Lesson = models.getModel('lesson');
  await Lesson.addToCollection(lessonId, 'authors', author[0].id);
  return res.status(HttpStatus.OK).send({ authorAddedSuccessfully: true });
}));

router.get('/courseStatistics/:user', asyncMiddleware(async (req, res) => {
  const userAndCompletedCourses = await findUsersAndTheirCompletedCourses();
  const orderedUserAndCompletedCourses = [];
  for (let i = userAndCompletedCourses.length - 1; i >= 0; i--) {
    orderedUserAndCompletedCourses.push(userAndCompletedCourses[i]);
  }
  const usersWithProgress = await findUsersWithProgress();
  const breadcrumbs = [{
    href: `/admin/index`,
    linkName: 'Manage Courses'
  }, {
    href: '#',
    linkName: 'Course Statistics'
  }];
  res.render('admin/courseStatistics', {
    orderedUserAndCompletedCourses,
    usersWithProgress,
    breadcrumbs,
    role: req.role
  });
}));

router.get('/index', asyncMiddleware(async (req, res) => {
  const courses = await findAllCourses(req.user);
  const breadcrumbs = [{
    href: '#',
    linkName: 'Manage Courses'
  }];
  res.render('admin/index', {
    courses,
    heading: 'Manage Courses',
    breadcrumbs,
    role: req.role
  });
}));

router.get('/user/:userId/:authorFilter', asyncMiddleware(async (req, res) => {
  const courses = await findCourseByAuthor(req.user, req.params.userId);
  const breadcrumbs = [{
    href: `/admin/index`,
    linkName: 'Manage Courses'
  }];
  res.render('admin/index', {
    breadcrumbs,
    courses,
    heading: 'Filter Courses By Author: ' + req.params.authorFilter,
    role: req.role
  });
}));

router.get('/tag/:tag_id/:tagFilter', asyncMiddleware(async (req, res) => {
  const courses = await findCoursesByTag(req.user, req.params.tag_id);
  const breadcrumbs = [{
    href: `/admin/index`,
    linkName: 'Manage Courses'
  }];
  res.render('admin/index', {
    breadcrumbs,
    courses,
    heading: 'Filter Courses By Tag: ' + req.params.tagFilter,
    role: req.role
  });
}));

router.post('/index', upload.single('courseimage'), asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  var imageName = req.body.imageName;

  const courses = await findCourseByTitle(req.body.title);

  switch(courses.length) {
    case 0:
        if (req.file) {
          IMAGE = req.file.originalname;
        }
        if (!req.file) {
          IMAGE = process.env.DEFAULTIMAGEURL;
        }
        if (imageName != "") {
          IMAGE = req.body.imageName;
        }
        const createdCourse = await Course.create({
          title: req.body.title,
          image: IMAGE,
          description: req.body.description,
        }).fetch();
        await Course.addToCollection(createdCourse.id, 'authors', req.user.id);
        return res.status(HttpStatus.OK).send({courseTitleExists: false, course: createdCourse});
    default:
      // return res.status(HttpStatus.OK).send({courseTitleExists: true, course: courses[0]});
      return res.redirect('/admin/home');
  }

}));

router.post('/index/update', upload.single('courseimage'), asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
 
  if (req.file) {
    IMAGE = req.file.originalname;
  }
  if (!req.file) {
    IMAGE = process.env.DEFAULTIMAGEURL;
  }

  let courseId = req.body.courseId;

  const Editedcourse = await Course.update({ id: courseId}).set({
      title: req.body.title,
      image: IMAGE,
      description: req.body.description,
  }).fetch();
  
  const breadcrumbs = [{
    href: '/admin/index',
    linkName: 'Manage'
  }, {
    href: '#',
    linkName: 'Course'
  }];

  return res.status(HttpStatus.OK).send(Editedcourse);
}));

router.put('/updateCourseTitle', upload.single('courseimage'), asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  let courseId = req.body.courseId;

  const Editedcourse = await Course.update({ id: courseId}).set({
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
  }).fetch();

  return res.status(HttpStatus.OK).send(Editedcourse);
}));

router.put('/updateCourseIcon', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  const courseId = req.body.courseId;
  const imagelink = req.body.image;
  const Editedcourse = await Course.update({ id: courseId}).set({
      image: imagelink,
  }).fetch();
  return res.status(HttpStatus.OK).send(Editedcourse);
}));

router.get('/:courseId', asyncMiddleware(async (req, res) => {
  await renderCourse(req, res, false);
}));

router.get('/delete/courses/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');

  await Course.update({ id: req.params.courseId })
    .set({
      isDeleted: 1,
    });

  res.redirect('/admin/index');
}));

router.post('/:courseId/editCourse', upload.single('courseimage'), asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  if (!(req.file)) {
    IMAGE = req.file;
  } else {
    IMAGE = req.file.originalname;
  }

  await Course.update({ id: req.params.courseId })
    .set({
      title: req.body.titleEdit,
      image: IMAGE,
      description: req.body.descriptionEdit
    });

  await renderCourse(req, res, false);
}));
router.post('/:courseId/lessons/:lessonId/EditLesson', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Lesson = models.getModel('lesson');

  const updatedLesson = await Lesson.update({ id: req.params.lessonId })
    .set({
      title: req.body.title,
      type: req.params.type,
      markdown: req.body.markdown,
    }).fetch();
  await updateCourseWhenLessonIsEdited(req.params.lessonId, req.params.courseId);
  return res.status(HttpStatus.OK).send(updatedLesson);
}));

router.post('/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const lesson = models.getModel('lesson');
  const presentation = models.getModel('presentation');
  const createdLesson = await lesson.create({
    title: req.body.title,
    type: req.body.type,
    markdown: "",
    durationInSeconds: req.body.duration,
    order: await getPreviousLessonOrderNumber(req.params.courseId),
    course: req.params.courseId,
    user: req.params.user,
  }).fetch();
  if (createdLesson.type == 'PRESENTATION') {
    const createdPresentation = await presentation.create({
      title: createdLesson.title,
      slides: '',
      author: req.user.name,
      createdBy: 'admin',
      transitionType: 'none'
    }).fetch();
    console.log(createdPresentation);
  }
  await assignAuthorToCourse(req.params.courseId, req.user.id);

  return res.status(HttpStatus.OK).send({ success: true });

}));

router.get('/decrease/numberOfLessonsToAdd/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  const course = await findOneCourse(req.params.courseId, req.user);
  await Course.update({ id: req.params.courseId })
    .set({
      numberOfLessonsToAdd: course.numberOfLessonsToAdd - 1,
    });
  await renderCourse(req, res, false);
}));
router.get('/add/numberOfLessonsToAdd/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  const course = await findOneCourse(req.params.courseId, req.user);
  await Course.update({ id: req.params.courseId })
    .set({
      numberOfLessonsToAdd: course.numberOfLessonsToAdd + 1,
    });
  await renderCourse(req, res, false);
}));

router.get('/uploadPresentation/:lesson/:slide/:courseid', asyncMiddleware(async (req, res) => {
  const lessonTitle = req.params.lesson;
  const slide = req.params.slide;
  const models = await initModels();
  const Presentation = models.getModel('presentation');
  const presentation = await Presentation.find({ title: req.params.lesson });
  const urllocation = "admin";

  const breadcrumbs = [{
    href: '/admin/index',
    linkName: 'Manage'
  }, {
    href: '#',
    linkName: 'Upload Presentation'
  }];

  slides = presentation[0].slides;

  res.render('uploadPresentation', {
    role: req.role,
    lessonTitle,
    slidedata: slides,
    slide,
    breadcrumbs,
    urllocation,
    courseId: req.params.courseid
  });
}));

router.post('/uploadPresentation/:lesson/:slide', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Presentation = models.getModel('presentation');

  await Presentation.update({ title: req.params.lesson })
    .set({
      slides: req.body.testmarkdown,
    });
  res.redirect('back');
}));


router.get('/uploadMarkdown/:lesson', asyncMiddleware(async (req, res) => {
  const lessonTitle = req.params.lesson;
  const models = await initModels();
  const Lesson = models.getModel('lesson');
  const lesson = await Lesson.find({ title: req.params.lesson });

  const breadcrumbs = [{
    href: '/admin/index',
    linkName: 'Manage'
  }, {
    href: `/admin/${lesson[0].course}`,
    linkName: 'Course'
  }, {
    href: '#',
    linkName: 'Upload Markdown'
  }];

  res.render('admin/uploadMarkdown', {
    role: req.role,
    lessonTitle,
    lesson,
    markdown: lesson[0].markdown,
    breadcrumbs
  });
}));

router.post('/uploadMarkdown/:lesson', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Lesson = models.getModel('lesson');

  await Lesson.update({ title: req.params.lesson })
    .set({
      markdown: req.body.markdown,
    });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.put('/:courseId/lessons/:lessonId/updateMultipleChoiceQuestion', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const MultipleChoiceQuestion = models.getModel('multiplechoicequestion');

  await MultipleChoiceQuestion
  .update({
    courseId: req.params.courseId,
    lessonId: req.params.lessonId
  })
  .set({ 
    question: req.body.question,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    answer: req.body.answer,
   });

  return res.status(HttpStatus.OK).send({ success: true });
}));

async function renderCourse(req, res, isEditMode) {
  const models = await initModels();
  const { courseId } = req.params;
  const course = await findOneCourse(courseId, req.user);
  const MultipleChoiceQuestion = models.getModel('multiplechoicequestion');
  const getMultipleChoiceQuestion = await MultipleChoiceQuestion.find({ courseId: courseId });
  const TrueOrFalseQuestion = models.getModel('trueorfalsequestion');
  const trueOrFalseQuestion = await TrueOrFalseQuestion.find({ courseId: courseId });

  const readyForBindingCourse = Object.assign({}, course, {
    descriptionMarkdown: markdownConverter.makeHtml(course.description),
  });

  const breadcrumbs = [{
    href: '/admin/index',
    linkName: 'Manage Courses',
  }, {
    href: '#',
    linkName: 'Course',
  }];

  res.render('admin/detail', {
    course: readyForBindingCourse,
    isEditMode,
    numberOfLessonsToAdd: course.numberOfLessonsToAdd,
    breadcrumbs,
    role: req.role,
    multipleChoiceQuestions: getMultipleChoiceQuestion,
    trueOrFalseQuestion,
  });
}

router.get('/:courseId/lessons/:lessonId/edit', asyncMiddleware(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const models = await initModels();
  const course = await findOneCourse(courseId);
  const lesson = await models.getModel('lesson').findOne(lessonId);

  const view = 'admin/edit-lesson-markdown';

  res.render(view, {
    course,
    lesson,
    heading: `Editing markdown for: ${lesson.title}`,
  });
}));

router.post('/:courseId/lessons/:lessonId/edit', asyncMiddleware(async (req, res) => {
  const { lessonId } = req.params;
  const { markdown } = req.body;
  const models = await initModels();

  await updateLessonMarkdown({
    lessonId,
    markdown,
    userId: req.user.id,
  });

  await models.getModel('lesson')
    .update({ id: lessonId })
    .set({ markdown });

  return res.status(HttpStatus.OK).send({ success: true });
}));

router.delete('/:courseId/lessons/:lessonId', asyncMiddleware(async (req, res) => {
  await deleteLesson(req.params.lessonId);
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/:courseId/lessons/:lessonId/move/:direction', asyncMiddleware(async (req, res) => {
  const {
    courseId,
    lessonId,
    direction,
  } = req.params;
  await moveLesson({ courseId, lessonId, direction });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/:courseId/lessons/:lessonId/upload/:fileExtension', asyncMiddleware(async (req, res, next) => {
  const { courseId, lessonId, fileExtension } = req.params;
  const pathToDestinationFolder = path.join(__dirname, '/../public/uploads');

  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, pathToDestinationFolder);
    },
    filename: (_req, _file, cb) => {
      cb(null, `${courseId}-${lessonId}.${fileExtension}`);
    },
  });

  const uploadMulter = multer({ storage: diskStorage });

  uploadMulter.single('lessonToBeUploaded')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    await updateLessonUrl(lessonId, `${pathToDestinationFolder}`);
    return res.status(HttpStatus.OK).send({ success: true });
  });
}));

router.post('/lessonId/:lessonId/duration', asyncMiddleware(async (req, res) => {
  const { lessonId } = req.params;
  const models = await initModels();
  const Lesson = models.getModel('lesson');
  await Lesson.update({ id: lessonId })
    .set({ durationInSeconds: req.body.lessonDuration });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.put('/deleteCourse/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  await Course.update({ id: req.params.courseId })
    .set({ isDeleted: true });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.put('/undoDeleteCourse/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Course = models.getModel('course');
  await Course.update({ id: req.params.courseId })
    .set({ isDeleted: false });
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/:courseId/upload', asyncMiddleware(async (req, res, next) => {
  const { courseId } = req.params;

  const pathToDestinationFolder = path.join(__dirname, '/../public/course_categories');

  const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, pathToDestinationFolder);
    },
    filename: (_req, _file, cb) => {
      cb(null, `${courseId}`);
    },
  });

  const uploadMulter = multer({ storage: diskStorage });

  uploadMulter.single('image-clip')(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    await updateImageUrl(courseId, pathToDestinationFolder);
    return res.status(HttpStatus.OK).send({ success: true });
  });
}));


router.get('/coursesByTitle/:title', asyncMiddleware(async (req, res) => {
  courses = await findCourseByTitle(req.params.title);
  if (courses.length > 0) {
    return res.status(HttpStatus.OK).send({ success: false });
  }
  return res.status(HttpStatus.OK).send({ success: true });
}));

router.get('/search/:search', asyncMiddleware(async (req, res) => {

  const models = await initModels();
  const Tag = models.getModel('tag');
  const Author = models.getModel('user');
  const tag = await Tag.find({ label: req.params.search });
  const author = await Author.find({ name: req.params.search });

  const breadcrumbs = [{
    href: `/admin/index`,
    linkName: 'Manage'
  }, {
    href: '#',
    linkName: 'Search'
  }];

  if (tag[0]) {
    const searchedByTag = await findCoursesByTag(req.user, tag[0].id);
    return res.render('admin/index', {
      courses: searchedByTag,
      breadcrumbs,
      role: req.role
    })
  } else if (author[0]) {
    const searchByAuthor = await findCourseByAuthor(req.user, author[0].id);
    return res.render('admin/index', {
      courses: searchByAuthor,
      breadcrumbs,
      role: req.role
    })
  }
  const searchByTitle = await findCourseWithTittle(req.user, req.params.search);
  if (searchByTitle[0]) {
    return res.render('admin/index', {
      courses: searchByTitle,
      breadcrumbs,
      role: req.role
    })
  } else {
    res.render('admin/errorPage', {
      breadcrumbs,
      role: req.role
    });
  }



}));

module.exports = router;