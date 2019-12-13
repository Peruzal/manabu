const express = require('express');
const asyncMiddleware = require('../middleware/asyncMiddleware');
const initModels = require('../models');
const HttpStatus = require('http-status-codes');
const showdown = require('showdown');
const _ = require('lodash');
const getDurationFromSeconds = require('../lib/getDurationFromSeconds');

const markdownConverter = new showdown.Converter();

const {
  findAllCourses,
  findOneCourse,
  findCourseByAuthor,
  findCoursesByTag,
  saveLatestCourseCompleted,
  sendEmailWhenCourseIsCompleted,
  getTagsOfOneCourse,
  findUserAndCompletedCoursesFromDb,
  findCoursesWithUserProgress,
  twoDigitFormat,
  getFavouriteCourses
} = require('../services/courseService');

const {
  updateLessonMarkdown,
  getLessonWithContributors,
  getContributions,
  deleteLesson,
  moveLesson,
  updateLessonUrl,
  addLesson,
  convertBookmarkedTimeToSeconds
} = require('../services/lessonService');

const router = express.Router();

router.get('/', asyncMiddleware(async (req, res) => {
  const courses = await findAllCourses(req.user);
  const breadcrumbs = [{
    href: `#`,
    linkName: 'Courses'
  }];
  res.render('courses/list', {
    breadcrumbs,
    courses,
    heading: 'Courses',
    role: req.role,
  });
}));
router.get('/:courseId/edit', asyncMiddleware(async (req, res) => {
  await renderCourse(req, res, true);
}));

router.get('/:courseId', asyncMiddleware(async (req, res) => {
  await renderCourse(req, res, false);
}));

router.get('/watching/:courseId/:lessonId', asyncMiddleware(async (req, res) => {
  const courseId = req.params.courseId;
  const courses = await findAllCourses(req.user);
  const completedCourses = await findUserAndCompletedCoursesFromDb(req.user.id);
  const coursesStillInProgress = await findCoursesWithUserProgress(req.user.id);
  const course = await findOneCourse(courseId, req.user);
  const favouriteCourses = await getFavouriteCourses(req.user.id);
  const lesson = await getLessonWithContributors({
    lessonId: req.params.lessonId,
    lessonTitle: req.body.title,
    courseWithProgress: course,
    role: req.role
  });

  const courseThatIsBeingWatched = Object.assign({}, course, {
    descriptionMarkdown: markdownConverter.makeHtml(course.description),
  });
  const models = await initModels();
  const Bookmark = models.getModel('bookmark');
  const bookmarks = await Bookmark.find({ userId: req.user.id });
  const Lesson = models.getModel('lesson');
  const lessonsOfCourse = await Lesson.find({ course: courseId })
    .populate('trueOrFalseQuestions')
    .populate('multipleChoiceQuestions');
  const courseCategories = [];

  for (let counter = 0; counter < course.lessons.length; counter++) {
    courseCategories.push(course.lessons[counter].category);
  }

  const tagsOfCourse = await getTagsOfOneCourse(courseId);
  const dataActionForSidebar = 'click->watchingcontroller#toggleSidebar';
  const dataActionForToolTipAppearing = 'mouseover->watchingcontroller#showTooltip(this)';
  const dataActionForToolTipDisappearing = 'mouseout->watchingcontroller#hideTooltip(this)';
  const breadcrumbs = [{
    href: '#',
    linkName: 'Watching',
  }, {
    href: '#',
    linkName: courseThatIsBeingWatched.title,
  }, {
    href: '#',
    linkName: lesson.title,
  }];
  res.render('watching', {
    user: req.user,
    currentUrl: req.path,
    breadcrumbs,
    dataActionForSidebar,
    dataActionForToolTipAppearing,
    dataActionForToolTipDisappearing,
    courses,
    completedCourses,
    numberOfCompletedCourses: twoDigitFormat(completedCourses.length),
    numberOfCoursesStillInProgress: twoDigitFormat(coursesStillInProgress.length),
    coursesStillInProgress,
    course: courseThatIsBeingWatched,
    tags: tagsOfCourse,
    courseCategories: _.uniq(courseCategories),
    lesson,
    bookmarks,
    favouriteCourses,
    lessonsOfCourse,
  });
}));

router.get('/bookmark/:courseId/:lessonId/:bookmarkedTime', asyncMiddleware(async (req, res) => {
  const courseId = req.params.courseId;
  const courses = await findAllCourses(req.user);
  const completedCourses = await findUserAndCompletedCoursesFromDb(req.user.id);
  const coursesStillInProgress = await findCoursesWithUserProgress(req.user.id);
  const course = await findOneCourse(courseId, req.user);
  const favouriteCourses = await getFavouriteCourses(req.user.id);
  const lesson = await getLessonWithContributors({
    lessonId: req.params.lessonId,
    lessonTitle: req.body.title,
    courseWithProgress: course,
    role: req.role
  });

  const courseThatIsBeingWatched = Object.assign({}, course, {
    descriptionMarkdown: markdownConverter.makeHtml(course.description),
  });
  const models = await initModels();
  const Bookmark = models.getModel('bookmark');
  const bookmarks = await Bookmark.find({ userId: req.user.id });
  const Lesson = models.getModel('lesson');
  const lessonsOfCourse = await Lesson.find({ course: courseId })
    .populate('trueOrFalseQuestions')
    .populate('multipleChoiceQuestions');
  const courseCategories = [];

  for (let counter = 0; counter < course.lessons.length; counter++) {
    courseCategories.push(course.lessons[counter].category);
  }

  const tagsOfCourse = await getTagsOfOneCourse(courseId);
  const dataActionForSidebar = 'click->watchingcontroller#toggleSidebar';
  const dataActionForToolTipAppearing = 'mouseover->watchingcontroller#showTooltip(this)';
  const dataActionForToolTipDisappearing = 'mouseout->watchingcontroller#hideTooltip(this)';
  const breadcrumbs = [{
    href: '#',
    linkName: 'Watching',
  }, {
    href: '#',
    linkName: courseThatIsBeingWatched.title,
  }, {
    href: '#',
    linkName: lesson.title,
  }];
  const bookmarkedTimeInSeconds = await convertBookmarkedTimeToSeconds(req.params.bookmarkedTime);
  lesson.progress = bookmarkedTimeInSeconds / lesson.durationInSeconds;

  res.render('watching', {
    user: req.user,
    currentUrl: req.path,
    breadcrumbs,
    dataActionForSidebar,
    dataActionForToolTipAppearing,
    dataActionForToolTipDisappearing,
    courses,
    completedCourses,
    numberOfCompletedCourses: twoDigitFormat(completedCourses.length),
    numberOfCoursesStillInProgress: twoDigitFormat(coursesStillInProgress.length),
    coursesStillInProgress,
    course: courseThatIsBeingWatched,
    tags: tagsOfCourse,
    courseCategories: _.uniq(courseCategories),
    lesson,
    bookmarks,
    favouriteCourses,
    lessonsOfCourse,
  });
}));

router.post('/bookmark', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Bookmark = models.getModel('bookmark');
  const bookmark = req.body;
  const createdBookmark = await Bookmark.create({
    courseId: bookmark.courseId,
    lessonId: bookmark.lessonId,
    userId: req.user.id,
    duration: getDurationFromSeconds(req.body.duration),
  }).fetch();
  return res.status(HttpStatus.OK).send(createdBookmark);
}));

router.post('/favourite', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const Favourite = models.getModel('favourite');
  const favourite = await Favourite.findOrCreate({
    courseId: req.body.courseId,
    userId: req.user.id,
  }, {
      courseId: req.body.courseId,
      userId: req.user.id,
      status: 0
    });
  let updatedFavourite = [];
  switch (favourite.status) {
    case 0:
      updatedFavourite.push(await Favourite.update({
        courseId: req.body.courseId,
        userId: req.user.id,
      }).set({
        courseId: req.body.courseId,
        userId: req.user.id,
        status: 1
      }).fetch());
      break;
    case 1:
      updatedFavourite.push(await Favourite.update({
        courseId: req.body.courseId,
        userId: req.user.id,
      }).set({
        courseId: req.body.courseId,
        userId: req.user.id,
        status: 0
      }).fetch());
      break;
  }

  return res.status(HttpStatus.OK).send(updatedFavourite[0][0]);
}));

router.get('/user/:userId/:authorFilter', asyncMiddleware(async (req, res) => {
  const courses = await findCourseByAuthor(req.user, req.params.userId);
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }];
  res.render('courses/list', {
    breadcrumbs,
    courses,
    heading: 'Filter Courses By Author: ' + req.params.authorFilter,
    role: req.role
  });
}));

router.get('/tag/:tag_id/:tagFilter', asyncMiddleware(async (req, res) => {
  const courses = await findCoursesByTag(req.user, req.params.tag_id);
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }];
  res.render('courses/list', {
    breadcrumbs,
    courses,
    heading: 'Filter Courses By Tag: ' + req.params.tagFilter,
    role: req.role
  });
}));

async function renderCourse(req, res, isEditMode) {
  const { courseId } = req.params;
  const course = await findOneCourse(courseId, req.user);

  const readyForBindingCourse = Object.assign({}, course, {
    descriptionMarkdown: markdownConverter.makeHtml(course.description),
  });
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }, {
    href: `#`,
    linkName: 'Course'
  }];
  res.render('courses/detail', {
    course: readyForBindingCourse,
    isEditMode,
    breadcrumbs,
    role: req.role
  });
};
router.get('/:courseId/lessons/:lessonId', asyncMiddleware(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { user } = req;
  const courseWithProgress = await findOneCourse(courseId, user);
  const breadcrumbs = [{
    href: `/courses`,
    linkName: 'Courses'
  }, {
    href: `/courses/${req.params.courseId}`,
    linkName: 'Course'
  }, {
    href: `#`,
    linkName: 'Lesson'
  }];
  const lesson = await getLessonWithContributors({
    lessonId,
    courseWithProgress,
    role: req.role
  });

  const view = `courses/${lesson.type.toLowerCase()}-lesson`;

  const models = await initModels();
  const TrueOrFalseQuestion = await models.getModel('trueorfalsequestion');
  const trueOrFalseQuestion = await TrueOrFalseQuestion.find({
    courseId: req.params.courseId,
    lessonId: req.params.lessonId,
  }).limit(1);

  const MultipleChoiceQuestion = models.getModel('multiplechoicequestion');
  const multipleChoiceQuestion = await MultipleChoiceQuestion.find({
    courseId: req.params.courseId,
    lessonId: req.params.lessonId
  }).limit(1);

  res.render(view, {
    multipleChoiceQuestion,
    trueOrFalseQuestion,
    course: courseWithProgress,
    lesson,
    heading: lesson.title,
    breadcrumbs,
    role: req.role
  });
}));

router.delete('/:courseId/lessons/:lessonId', asyncMiddleware(async (req, res) => {
  await deleteLesson(req.params.lessonId);
  return res.status(HttpStatus.OK).send({ success: true });
}));
router.get('/:courseId/:lessonId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const lesson = models.getModel('lesson');

  await lesson.destroy({ id: req.params.lessonId });

  res.redirect(`/courses/${req.params.courseId}/${req.params.lessonId}`);
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

router.post('/:courseId/lessons', asyncMiddleware(async (req, res) => {
  const lesson = await addLesson({
    lesson: Object.assign(req.body, { course: req.params.courseId }),
    author: req.user,
  });
  return res.status(HttpStatus.CREATED).send(lesson);
}));

router.post('/:courseId/addLesson', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const lesson = models.getModel('lesson');

  await lesson.create({
    title: req.body.title,
    type: req.body.type,
    markdown: req.body.markdown,
    durationInSeconds: req.body.duration,
    order: 800,
    course: req.params.courseId,
    user: req.params.user,
  }).fetch();
  res.redirect(`/courses/${req.params.courseId}/${req.params.lessonId}`);

}));

router.get('/:courseId/lessons/:lessonId/contributions', asyncMiddleware(async (req, res) => {
  const { lessonId, courseId } = req.params;

  const { lesson, snapshots } = await getContributions(lessonId);

  const view = 'courses/lesson-contributions';

  res.render(view, {
    lesson,
    snapshots,
    course,
    role: req.role
  });
}));
router.get('/:courseId/lessons/:lessonId/edit', asyncMiddleware(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const models = await initModels();
  const course = await findOneCourse(courseId);
  const lesson = await models.getModel('lesson').findOne(lessonId);

  const view = 'courses/includes/edit-lesson-markdown';

  res.render(view, {
    course,
    lesson,
    heading: `Editing markdown for: ${lesson.title}`,
    role: req.role
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

router.put('/complete-lesson/:lessonId/:courseId', asyncMiddleware(async (req, res) => {
  const models = await initModels();
  const LessonProgress = models.getModel('lessonprogress');
  const lessonId = req.params.lessonId;
  const courseId = req.params.courseId;
  var date = new Date();
  findLessonProgress = await LessonProgress.find({
    user: req.user.id,
    lessonId: lessonId,
    courseId: courseId
  });
  if (!findLessonProgress[0]) {
    await LessonProgress.create({
      user: req.user.id,
      lessonId: lessonId,
      courseId: courseId,
      progress: 0,
      date: date.toDateString()
    });
  }
  completedLessonProgress = await LessonProgress.update({ user: req.user.id, lessonId: lessonId, courseId: courseId })
    .set({
      progress: 1,
      date: date.toDateString()
    }).fetch();
  await saveLatestCourseCompleted(req.user.name);
  return res.status(HttpStatus.OK).send(completedLessonProgress);
}));

router.post('/:courseId/lessons/:lessonId/record-progress', asyncMiddleware(async (req, res) => {

  const { lessonId, courseId } = req.params;
  const { progress } = req.body;
  const models = await initModels();
  const LessonProgress = models.getModel('lessonprogress');
  const User = models.getModel('user');
  var date = new Date();
  const userId = req.user.id;

  await LessonProgress
    .findOrCreate({
      lessonId,
      user: userId,
    }, {
        lessonId,
        courseId,
        user: userId,
        date: date.toDateString(),
        progress: 0,
      });

  const lessonprogress = await LessonProgress.update({
    user: userId,
    lessonId,
    progress: { '<': progress },
  }, {
      progress,
      date: date.toDateString(),
    });

  return res.status(HttpStatus.OK).send({ success: true });
}));

router.post('/completedCourses', asyncMiddleware(async (req, res) => {
  const courses = await findAllCourses(req.user);
  await sendEmailWhenCourseIsCompleted(courses, req.user);
  return res.status(HttpStatus.OK).send(courses);
}));


module.exports = router;
