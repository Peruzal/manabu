const getDurationFromSeconds = require('../lib/getDurationFromSeconds');
const _ = require('lodash');
const initModels = require('../models');
const sendmail = require('sendmail')();

async function getCoursesWithLessons() {
  const models = await initModels();
  const allCourses = await models
    .getModel('course')
    .find()
    .populate('tags')
    .populate('authors')
    .populate('lessons');
  const coursesWithLessons = [];
  allCourses.forEach(course => {
    if (course.lessons.length > 0 && !course.isDeleted) {
      coursesWithLessons.push(course);
    }
  });
  return coursesWithLessons;
}

async function assignAuthorToCourse(courseId, userId) {
  const models = await initModels();
  const course_authors__user_courses = await models.getModel('course_authors__user_courses').create({
    course_authors: courseId,
    user_courses: userId
  });
  return course_authors__user_courses;
}

async function getCourseTitlesAuthoredByUser(userId) {
  const models = await initModels();
  const course_authors__user_courses = await models
    .getModel('course_authors__user_courses')
    .find({ user_courses: userId });
  const listOfCourseTitlesAuthoredByUser = [];
  for (let i = 0; i < course_authors__user_courses.length; i += 1) {
    const course = await models.getModel('course').find({ id: course_authors__user_courses[i].course_authors });
    if (course[0]) {
      listOfCourseTitlesAuthoredByUser.push(course[0].title);
    }
  }
  return _.uniq(listOfCourseTitlesAuthoredByUser);
}

async function getCoursesAuthoredByUser(userId) {
  const models = await initModels();
  const course_authors__user_courses = await models
    .getModel('course_authors__user_courses')
    .find({ user_courses: userId });
  const listOfCoursesAuthoredByUser = [];
  for (let i = 0; i < course_authors__user_courses.length; i += 1) {
    const course = await models
      .getModel('course')
      .find({ id: course_authors__user_courses[i].course_authors })
      .populate('authors')
      .populate('tags')
      .populate('lessons');
    if (course[0]) {
      const courseWithTagsAndLessons = Object.assign({}, course[0], {
        lessonTypeCounts: _.countBy(course[0].lessons, 'type'),
        tagCounts: course[0].tags.length,
        authorCounts: course[0].authors.length
      });
      listOfCoursesAuthoredByUser.push(courseWithTagsAndLessons);
    }
  }
  return listOfCoursesAuthoredByUser;
}

async function getActiveCoursesAuthoredByUser(userId) {
  const allCoursesByAuthor = await getCoursesAuthoredByUser(userId);
  const listOfActiveCoursesAuthoredByUser = [];
  allCoursesByAuthor.forEach(course => {
    if (!course.isDeleted) {
      listOfActiveCoursesAuthoredByUser.push(course);
    }
  });
  return listOfActiveCoursesAuthoredByUser;
}

async function getArchivedCoursesByUser(userId) {
  const allCoursesAuthoredByUser = await getCoursesAuthoredByUser(userId);
  const listOfArchivedCoursesAuthoredByUser = [];
  allCoursesAuthoredByUser.forEach(course => {
    if (course.isDeleted === 1) {
      listOfArchivedCoursesAuthoredByUser.push(course);
    }
  });
  return listOfArchivedCoursesAuthoredByUser;
}

async function addTagToCourse(label, courseId) {
  const models = await initModels();
  const Tag = models.getModel('tag');
  const Course = models.getModel('course');
  const course = await Course.find({ id: courseId }).populate('tags');
  const tagLabelsOfCourse = course[0].tags.map(tag => tag.label);
  if (tagLabelsOfCourse.includes(label)) {
    return;
  }
  const newTag = await Tag.create({
    label: label
  }).fetch();
  await Course.addToCollection(courseId, 'tags', newTag.id);
}

async function addAuthorToCourse(authorId, courseId, lessonId) {
  const models = await initModels();
  const CourseAndAuthor = models.getModel('course_authors__user_courses');
  const LessonAndAuthor = models.getModel('lesson_authors__user_lessons');
  let courseAndAuthor = await CourseAndAuthor.findOne({
    user_courses: authorId,
    course_authors: courseId
  });
  if (!courseAndAuthor || courseAndAuthor === undefined) {
    courseAndAuthor = await CourseAndAuthor.create({
      user_courses: authorId,
      course_authors: courseId
    }).fetch();
  }
  let lessonAndAuthor = await LessonAndAuthor.findOne({
    user_lessons: authorId,
    lesson_authors: lessonId
  });
  if (!lessonAndAuthor || lessonAndAuthor === undefined) {
    lessonAndAuthor = await LessonAndAuthor.create({
      user_lessons: authorId,
      lesson_authors: lessonId
    }).fetch();
  }
  return [courseAndAuthor, lessonAndAuthor];
}

function prepCourse(course, lessonProgressPerCourse) {
  const lessonProgress =
    lessonProgressPerCourse && lessonProgressPerCourse[course.id]
      ? lessonProgressPerCourse[course.id]
      : {
          lessons: {},
          completedCount: 0,
          started: false
        };

  return Object.assign({}, course, {
    duration: getDurationFromSeconds(_.sumBy(course.lessons, 'durationInSeconds'), true),
    counts: _.countBy(course.lessons, 'type'),
    lessonProgress
  });
}

async function getLessonProgressPerCourse(user) {
  const models = await initModels();
  const lessonProgress = await models.getModel('lessonprogress').find({ user: user.id });

  const lessonProgressPerCourse = _.reduce(
    lessonProgress,
    (sum, currentProgress) => {
      const lessonProgressForCourse = sum[currentProgress.courseId] || {
        lessons: {},
        completedCount: 0
      };
      const translatedProgress = currentProgress.progress > 0.95 ? 1 : currentProgress.progress;
      const lessonWeight = translatedProgress === 1 ? 1 : 0;
      return Object.assign({}, sum, {
        [currentProgress.courseId]: Object.assign({}, lessonProgressForCourse, {
          lessons: Object.assign({}, lessonProgressForCourse.lessons, {
            [currentProgress.lessonId]: translatedProgress
          }),
          completedCount: lessonProgressForCourse.completedCount + lessonWeight,
          started: true
        })
      });
    },
    {}
  );

  return lessonProgressPerCourse;
}

async function getNumberOfCompletedLessonsForThisCourse(userId, courseId) {
  const lessonProgressPerCourse = await getLessonProgressPerCourse(userId);
  return lessonProgressPerCourse[courseId].completedCount;
}

async function findAllCourses(user) {
  const courses = await getCoursesWithLessons();

  const lessonProgressPerCourse = await getLessonProgressPerCourse(user);
  return courses.map(course => prepCourse(course, lessonProgressPerCourse));
}
async function findCourseWithTittle(user, title) {
  const models = await initModels();
  const courses = await models
    .getModel('course')
    .find({ title: title })
    .populate('authors')
    .populate('tags')
    .populate('lessons');

  const lessonProgressPerCourse = await getLessonProgressPerCourse(user);
  return courses.map(course => prepCourse(course, lessonProgressPerCourse));
}
async function findOneCourse(id, user) {
  const models = await initModels();
  const course = await models
    .getModel('course')
    .findOne(id)
    .populate('authors')
    .populate('tags')
    .populate('lessons');

  if (!course || course.length === 0 || course === undefined) {
    return [];
  }

  const lessons = (await Promise.all(
    course.lessons.map(lesson =>
      models
        .getModel('lesson')
        .findOne(lesson.id)
        .populate('authors')
    )
  ))
    .map(lesson =>
      Object.assign({}, lesson, {
        duration: getDurationFromSeconds(lesson.durationInSeconds)
      })
    )
    .sort((l1, l2) => l1.order - l2.order);

  let lessonProgressPerCourse;
  if (user) {
    lessonProgressPerCourse = await getLessonProgressPerCourse(user);
  }

  return prepCourse(Object.assign({}, course, { lessons }), lessonProgressPerCourse);
}

async function findCourseByTitle(title) {
  const models = await initModels();
  const courses = await models.getModel('course').find();
  const matchingCourses = courses.filter(course => course.title.toLowerCase() === title.toLowerCase());

  return matchingCourses;
}

async function findCourseByAuthor(user, userId) {
  const models = await initModels();
  const course_authors__user_courses = await models
    .getModel('course_authors__user_courses')
    .find({ user_courses: userId });
  const courses = [];
  for (let i = 0; i < course_authors__user_courses.length; i += 1) {
    const temp = await models
      .getModel('course')
      .find({ id: course_authors__user_courses[i].course_authors })
      .populate('authors')
      .populate('tags')
      .populate('lessons');
    courses.push(temp[0]);
  }

  const lessonProgressPerCourse = await getLessonProgressPerCourse(user);
  return courses.map(course => prepCourse(course, lessonProgressPerCourse));
}
async function findCoursesByTag(user, tag_id) {
  const models = await initModels();
  const course_tags__tag_courses = await models.getModel('course_tags__tag_courses').find({ tag_courses: tag_id });
  const courses = [];
  for (let i = 0; i < course_tags__tag_courses.length; i += 1) {
    const temp = await models
      .getModel('course')
      .find({ id: course_tags__tag_courses[i].course_tags })
      .populate('authors')
      .populate('tags')
      .populate('lessons');
    courses.push(temp[0]);
  }

  const lessonProgressPerCourse = await getLessonProgressPerCourse(user);
  return courses.map(course => prepCourse(course, lessonProgressPerCourse));
}

async function getTitlesOfCourses() {
  const courses = await getCoursesWithLessons();
  const titles = [];
  for (let i = 0; i < courses.length; i += 1) {
    titles.push(courses[i].title);
  }
  return titles;
}

async function getTagsOfCourses() {
  const models = await initModels();
  const tagObjects = await models
    .getModel('course')
    .find()
    .populate('tags');
  let tags = [];
  let tagLabels = [];
  for (let i = 0; i < tagObjects.length; i += 1) {
    tags.push(tagObjects[i].tags);
    tags = _.flatten(tags);
  }
  for (let j = 0; j < tags.length; j += 1) {
    tagLabels.push(tags[j].label);
    tagLabels = _.uniq(tagLabels);
  }
  return tagLabels;
}

async function getTagsOfOneCourse(courseId) {
  const models = await initModels();
  const tagsOfCourse = await models
    .getModel('course')
    .find({ id: courseId })
    .populate('tags');
  let tags = [];
  let tagLabels = [];
  for (let i = 0; i < tagsOfCourse.length; i += 1) {
    tags.push(tagsOfCourse[i].tags);
    tags = _.flatten(tags);
  }
  for (let j = 0; j < tags.length; j += 1) {
    tagLabels.push(tags[j].label);
    tagLabels = _.uniq(tagLabels);
  }
  return tagLabels;
}

async function isTagOfCourse(tagLabel, courseTitle) {
  let courseHasTag = false;
  const models = await initModels();
  const course = await models
    .getModel('course')
    .find({ title: courseTitle })
    .populate('tags');
  const { tags } = course[0].tags;
  try {
    if (tags.length === 0) throw new Error('This course has no tags.');
    else {
      for (let i = 0; i < tags.length; i += 1) {
        if (tags[i].label.toLowerCase() === tagLabel.toLowerCase()) {
          courseHasTag = true;
        }
      }
    }
  } catch (err) {
    return err.message;
  }
  return courseHasTag;
}

async function getAuthorsOfCourses() {
  const models = await initModels();
  const allCourses = await models
    .getModel('course')
    .find()
    .populate('authors');
  const authorsOfAllCourses = allCourses
    .map(author => author.authors)
    .map(author => `${author[0].name} ${author[0].surname} ${author[0].email}`);
  const authorsOfWatchedAndWatchingCoursesWithEmail = _.uniq(authorsOfAllCourses);
  const authorsWithoutEmail = authorsOfWatchedAndWatchingCoursesWithEmail.map(authorWithEmail =>
    authorWithEmail.substring(0, authorWithEmail.lastIndexOf(' '))
  );
  return authorsWithoutEmail;
}

async function isAuthorOfCourse(authorName, courseTitle) {
  let courseHasAuthor = false;
  const models = await initModels();
  const course = await models
    .getModel('course')
    .find({ title: courseTitle })
    .populate('authors');
  const authors = { authors: course[0].authors };
  try {
    if (authors.length === 0) throw new Error('This course has no authors, even though this is impossible.');
    else {
      for (let i = 0; i < authors.length; i += 1) {
        const nameOfAuthor = `${authors[i].name} ${authors[i].surname}`;
        if (nameOfAuthor.toLowerCase() === authorName.toLowerCase()) {
          courseHasAuthor = true;
        }
      }
    }
  } catch (err) {
    return err.message;
  }
  return courseHasAuthor;
}

async function getTitlesTagsAndAuthorsOfCourses() {
  const titles = await getTitlesOfCourses();
  const tags = await getTagsOfCourses();
  const authors = await getAuthorsOfCourses();
  const titlesTagsAndAuthors = await _.concat(titles, tags, authors);
  return titlesTagsAndAuthors;
}

async function findAllUsersFromLessonProgress(lessonProgressToFindUsers) {
  const usersToBeFiltered = [];
  lessonProgressToFindUsers.forEach(lessonProgressToFindUser => {
    usersToBeFiltered.push(lessonProgressToFindUser.user);
  });
  return usersToBeFiltered;
}

async function filterRepeatingValues(array) {
  const values = [];
  array.sort().filter((value, pos, ary) => {
    if (!pos || value != ary[pos - 1]) {
      if (!value == '' || !value == null) {
        values.push(value);
      }
    }
  });
  return values;
}

async function searchLessonProgress(courseId, user, progress) {
  const models = await initModels();
  const searchedProgress = [];
  const lessonProgress = await models.getModel('lessonprogress').find({ where: { user: user } });
  lessonProgress.forEach(lesson => {
    if (lesson.courseId === courseId && lesson.progress === progress) {
      searchedProgress.push(lesson);
    }
  });
  return searchedProgress;
}

async function seachLessonByCourseId(courseId) {
  const models = await initModels();
  const lesson = await models.getModel('lesson').find({ course: courseId });
  return lesson;
}

async function getdatesForCompletedCourseLessons(lessonProgressForCompletedCourses) {
  const dates = [];
  lessonProgressForCompletedCourses.forEach(lesson => {
    dates.push(new Date(lesson.date));
  });
  return dates;
}

async function getCourseIdsForLessonsWithUserProgress(userId) {
  const models = await initModels();
  const lessonProgress = await models.getModel('lessonprogress').find({ where: { user: userId } });
  const courseIdsForLessonsWithUserProgress = lessonProgress.map(lesson => lesson.courseId);
  return courseIdsForLessonsWithUserProgress;
}

async function getCourseIdsOfUserCompletedCourses(userId) {
  const models = await initModels();
  const completedCourse = await models.getModel('completedcourse').find({ where: { userId: userId } });
  const courseIdsOfUserCompletedCourses = completedCourse.map(course => course.courseId);
  return courseIdsOfUserCompletedCourses;
}

async function findUsersAndTheirCompletedCourses() {
  const models = await initModels();
  const CourseCompleted = models.getModel('completedcourse');
  const usersAndTheirCompletedCourses = await CourseCompleted.find({});
  return usersAndTheirCompletedCourses;
}

async function findUserAndCompletedCourses(user) {
  const userAndCompletedCourses = [];
  const models = await initModels();
  const Courses = models.getModel('course');
  const courses = await Courses.find({});

  for (let i = 0; i < courses.length; i += 1) {
    const lessonProgressForCompletedCourses = await searchLessonProgress(courses[i].id, user, 1);
    const lessonsForCompletedCourses = await seachLessonByCourseId(courses[i].id);
    const datesForCompletedCourseLessons = await getdatesForCompletedCourseLessons(lessonProgressForCompletedCourses);

    if (lessonsForCompletedCourses[0]) {
      if (lessonsForCompletedCourses.length === lessonProgressForCompletedCourses.length) {
        const dateWhenCourseCompleted = datesForCompletedCourseLessons.sort((first, second) => {
          return second - first;
        });
        const completedCourse = Courses.find({ id: lessonProgressForCompletedCourses[0].courseId });
        const completedCourseInfo = {
          courseId: completedCourse[0].id,
          username: lessonProgressForCompletedCourses[0].user,
          courseName: completedCourse[0].title,
          date: dateWhenCourseCompleted[0].toLocaleDateString()
        };
        userAndCompletedCourses.push(completedCourseInfo);
      } else {
        console.log('course: ' + courses[i].title + ' not finished');
      }
    }
  }
  return userAndCompletedCourses;
}

async function saveCompletedCourse(newCompletedCourse) {
  const models = await initModels();
  const CourseCompleted = models.getModel('completedcourse');
  await CourseCompleted.create(newCompletedCourse).fetch();
}

async function findUserAndCompletedCoursesFromDb(userId) {
  const usersAndTheirCompletedCourses = await findUsersAndTheirCompletedCourses();
  const filteredByUser = [];
  usersAndTheirCompletedCourses.forEach(userAndTheirCompletedCourses => {
    if (userAndTheirCompletedCourses.userId === userId) {
      filteredByUser.push(userAndTheirCompletedCourses);
    }
  });
  return filteredByUser;
}

async function userCompletedThisCourse(userId, courseId) {
  let courseIsCompleted = false;
  const userCompletedCourses = await findUserAndCompletedCoursesFromDb(userId);
  userCompletedCourses.forEach(completedCourse => {
    if (completedCourse.courseId === courseId) {
      courseIsCompleted = true;
    }
  });
  return courseIsCompleted;
}

async function courseIsCompletedByUser(userId, courseTitle) {
  let courseIsCompleted = false;
  const userCompletedCourses = await findUserAndCompletedCoursesFromDb(userId);
  userCompletedCourses.forEach(completedCourse => {
    if (completedCourse.courseName === courseTitle) {
      courseIsCompleted = true;
    }
  });
  return courseIsCompleted;
}

async function findCoursesWithUserProgress(user) {
  const allCourses = await getCoursesWithLessons();
  const courseIdsOfCoursesInProgress = await getCourseIdsForLessonsWithUserProgress(user);
  const courseIdsOfUserCompletedCourses = await getCourseIdsOfUserCompletedCourses(user);
  const courseIdsOfIncompleteCoursesBeingWatched = courseIdsOfCoursesInProgress.filter(
    id => !courseIdsOfUserCompletedCourses.includes(id)
  );
  const coursesThatUserIsWatching = allCourses
    .filter(course => courseIdsOfIncompleteCoursesBeingWatched.includes(course.id))
    .map(course => course.title);
  return coursesThatUserIsWatching;
}

async function findUsersWithProgress() {
  const models = await initModels();
  const lessonProgressToFindUsers = await models.getModel('lessonprogress').find({});
  const allUsersFromLessonProgress = await findAllUsersFromLessonProgress(lessonProgressToFindUsers);
  const filteredValues = await filterRepeatingValues(allUsersFromLessonProgress);
  return filteredValues;
}

async function getIdsOfUsersWatchingThisCourse(courseId) {
  const models = await initModels();
  const LessonProgress = models.getModel('lessonprogress');
  const lessonProgress = await LessonProgress.find({ courseId: courseId });
  const idsOfUsersWatchingCourse = _.uniq(lessonProgress.map(courseBeingWatched => courseBeingWatched.user));
  return idsOfUsersWatchingCourse;
}

async function getAllUsersWatchingThisCourse(courseId) {
  const idsOfUsersWatchingCourse = await getIdsOfUsersWatchingThisCourse(courseId);
  const models = await initModels();
  const User = models.getModel('user');
  const usersWatchingThisCourse = [];
  for (let i = 0; i < idsOfUsersWatchingCourse.length; i += 1) {
    const userWatchingThisCourse = await User.findOne({ id: idsOfUsersWatchingCourse[i] });
    usersWatchingThisCourse.push(userWatchingThisCourse);
  }
  return usersWatchingThisCourse;
}

async function getIdsOfUsersWhoCompletedThisCourse(courseId) {
  const models = await initModels();
  const CompletedCourse = models.getModel('completedcourse');
  const completedCourse = await CompletedCourse.find({ courseId: courseId });
  const idsOfUsersWhoCompletedThisCourse = _.uniq(completedCourse.map(courseCompleted => courseCompleted.userId));
  return idsOfUsersWhoCompletedThisCourse;
}

async function getAllUsersWhoCompletedThisCourse(courseId) {
  const idsOfUsersWhoCompletedThisCourse = await getIdsOfUsersWhoCompletedThisCourse(courseId);
  const models = await initModels();
  const User = models.getModel('user');
  const usersWhoCompletedThisCourse = [];
  for (let i = 0; i < idsOfUsersWhoCompletedThisCourse.length; i += 1) {
    const userWhoCompletedThisCourse = await User.findOne({ id: idsOfUsersWhoCompletedThisCourse[i] });
    usersWhoCompletedThisCourse.push(userWhoCompletedThisCourse);
  }
  return usersWhoCompletedThisCourse;
}

async function getTitlesOfAllCoursesBeingWatched() {
  const allUsersCurrentlyWatchingACourse = await findUsersWithProgress();
  const titlesOfAllCoursesBeingWatched = [];
  for (let i = 0; i < allUsersCurrentlyWatchingACourse.length; i += 1) {
    const titlesOfCoursesBeingWatchedByThisUser = await findCoursesWithUserProgress(
      allUsersCurrentlyWatchingACourse[i]
    );
    titlesOfAllCoursesBeingWatched.push(titlesOfCoursesBeingWatchedByThisUser);
  }
  return _.flatten(titlesOfAllCoursesBeingWatched);
}

async function mapOfNumberOfPeopleWatchingACourse() {
  const models = await initModels();
  const Course = models.getModel('course');
  const allCourses = await Course.find({});
  const mapOfCourseTitleAndNumberOfWatchers = new Map();
  const titlesOfAllCoursesBeingWatched = await getTitlesOfAllCoursesBeingWatched();
  allCourses.forEach(course => {
    mapOfCourseTitleAndNumberOfWatchers[course.title] = 0;
  });
  titlesOfAllCoursesBeingWatched.forEach(title => {
    mapOfCourseTitleAndNumberOfWatchers[title] += 1;
  });
  return mapOfCourseTitleAndNumberOfWatchers;
}

async function mapOfNumberOfPeopleWatchingCoursesByAuthor(authorId) {
  const courseTitlesByAuthor = await getCourseTitlesAuthoredByUser(authorId);
  const mapOfCourseTitleAndNumberOfWatchers = await mapOfNumberOfPeopleWatchingACourse();
  const mapOfCourseTitleByAuthorAndNumberOfWatchers = Object.keys(mapOfCourseTitleAndNumberOfWatchers)
    .filter(courseTitle => courseTitlesByAuthor.includes(courseTitle))
    .reduce((filteredMap, courseTitle) => {
      const newFilteredMap = filteredMap;
      newFilteredMap[courseTitle] = mapOfCourseTitleAndNumberOfWatchers[courseTitle];
      return newFilteredMap;
    }, {});
  return mapOfCourseTitleByAuthorAndNumberOfWatchers;
}

async function getNumberOfPeopleWatchingThisCourse(courseTitle) {
  const mapOfCourseTitleAndNumberOfWatchers = await mapOfNumberOfPeopleWatchingACourse();
  if (!mapOfCourseTitleAndNumberOfWatchers[courseTitle]) {
    return 0;
  }
  return mapOfCourseTitleAndNumberOfWatchers[courseTitle];
}

async function sendEmail(newCompletedCourse) {
  const completedCourse = newCompletedCourse.courseName;
  const models = await initModels();
  const WebhookEmail = models.getModel('webhookemail');
  const listOfWebhookEmails = await WebhookEmail.find({ course: completedCourse });
  const listOfPeopleToBeEmailed = [];
  if (listOfWebhookEmails.length !== 0) {
    listOfWebhookEmails.forEach(webhookEmail => {
      if (webhookEmail.course === completedCourse) {
        listOfPeopleToBeEmailed.push(webhookEmail.email);
      }
    });
  }
  listOfPeopleToBeEmailed.forEach(personToBeEmailed => {
    sendmail(
      {
        from: 'Manabu@manabu.co.za',
        to: personToBeEmailed,
        subject: `${newCompletedCourse.username} has completed a course.`,
        html: `Great news!!! ${newCompletedCourse.username} has finally completed the course: ${completedCourse}`
      },
      (err, reply) => {
        console.log(err && err.stack);
        console.dir(reply);
      }
    );
    console.log('send mail method called');
  });
}

async function saveLatestCourseCompleted(username) {
  console.log('Checking if there is a new course completed...');
  const userAndCompletedCourses = await findUserAndCompletedCourses(username);
  const userAndCompletedCoursesFromDb = await findUserAndCompletedCoursesFromDb(username);

  if (userAndCompletedCourses.length === parseInt(userAndCompletedCoursesFromDb.length, 10) + 1) {
    const newCompletedCourse = userAndCompletedCourses[parseInt(userAndCompletedCourses.length, 10) - 1];
    await sendEmail(newCompletedCourse);
    await saveCompletedCourse(newCompletedCourse);
  } else {
    console.log('No new course completed by ' + username);
  }
}

async function sendEmailWhenCourseIsCompleted(courses, user) {
  const models = await initModels();
  const Completedcourse = models.getModel('completedcourse');
  const date = new Date();

  courses.forEach(async course => {
    if (course.lessons.length === course.lessonProgress.completedCount) {
      const completedCourse = await Completedcourse.find({
        courseId: course.id,
        userId: user.id,
        username: user.name,
        courseName: course.title,
        image: course.image
      });

      if (!completedCourse[0]) {
        const newCompletedCourse = await Completedcourse.create({
          courseId: course.id,
          userId: user.id,
          username: user.name,
          courseName: course.title,
          date: date.toDateString(),
          image: course.image
        }).fetch();
        await sendEmail(newCompletedCourse);
      }
    }
  });
}

function twoDigitFormat(number) {
  const numberAsString = number.toString();
  if (number < 10) {
    return `0${numberAsString}`;
  }
  return number;
}

async function randomiseCourses() {
  const courses = await getCoursesWithLessons();
  try {
    if (_.isEmpty(courses)) throw new Error('There are no available courses.');
    else {
      let shuffles = courses.length - 1;
      while (shuffles > 0) {
        const randomNumber = Math.floor(Math.random() * shuffles);
        const temp = courses[randomNumber];
        courses[randomNumber] = courses[shuffles];
        courses[shuffles] = temp;
        shuffles -= 1;
      }
    }
  } catch (err) {
    return err.message;
  }
  return courses;
}

async function selectOneRandomCourse() {
  const randomCourses = await randomiseCourses();
  return randomCourses[0];
}

async function getTitlesOfWatchedAndWatchingCourses(userId) {
  const watchedCourses = await findUserAndCompletedCoursesFromDb(userId);
  const watchingCourses = await findCoursesWithUserProgress(userId);
  const titlesOfWatchedAndWatchingCourses = [];
  if (watchedCourses && watchedCourses.length > 0) {
    for (let i = 0; i < watchedCourses.length; i += 1) {
      titlesOfWatchedAndWatchingCourses.push(watchedCourses[i].courseName);
    }
  }
  if (watchingCourses && watchingCourses.length > 0) {
    for (let i = 0; i < watchingCourses.length; i += 1) {
      titlesOfWatchedAndWatchingCourses.push(watchingCourses[i]);
    }
  }
  return _.compact(titlesOfWatchedAndWatchingCourses);
}

async function getWatchedOrWatchingCourses(userId) {
  const titlesOfWatchedAndWatchingCourses = await getTitlesOfWatchedAndWatchingCourses(userId);
  const models = await initModels();
  const Course = await models.getModel('course');
  const watchedOrWatchingCourses = [];
  if (titlesOfWatchedAndWatchingCourses.length > 0) {
    for (const title of titlesOfWatchedAndWatchingCourses) {
      const watchedOrWatchingCourse = await Course.findOne({ title: title })
        .populate('tags')
        .populate('authors')
        .populate('lessons');
      watchedOrWatchingCourses.push(watchedOrWatchingCourse);
    }
  }
  return watchedOrWatchingCourses;
}

async function isWatchedOrWatchingCourse(userId, courseTitle) {
  let courseIsWatchedOrWatching = false;
  const titlesOfWatchedAndWatchingCourses = await getTitlesOfWatchedAndWatchingCourses(userId);
  try {
    if (titlesOfWatchedAndWatchingCourses.length === 0)
      throw new Error('No courses have been watched, nor are any being watched currently.');
    else {
      for (let i = 0; i < titlesOfWatchedAndWatchingCourses.length; i += 1) {
        if (courseTitle.toLowerCase() === titlesOfWatchedAndWatchingCourses[i].toLowerCase()) {
          courseIsWatchedOrWatching = true;
        }
      }
    }
  } catch (err) {
    return err.message;
  }
  return courseIsWatchedOrWatching;
}

async function getTitlesOfUnwatchedCourses(userId) {
  const titlesOfAllCourses = await getTitlesOfCourses();
  const titlesOfWatchedAndWatchingCourses = await getTitlesOfWatchedAndWatchingCourses(userId);
  const titlesOfUnwatchedCourses = titlesOfAllCourses.filter(
    title => !titlesOfWatchedAndWatchingCourses.includes(title)
  );
  return titlesOfUnwatchedCourses;
}

async function getUnwatchedCourses(userId) {
  const models = await initModels();
  const Course = models.getModel('course');
  const titlesOfUnwatchedCourses = await getTitlesOfUnwatchedCourses(userId);
  const unwatchedCourses = [];
  for (const title of titlesOfUnwatchedCourses) {
    const unwatchedCourse = await Course.findOne({ title: title })
      .populate('tags')
      .populate('authors')
      .populate('lessons');
    unwatchedCourses.push(unwatchedCourse);
  }
  return unwatchedCourses;
}

async function getTagsOfWatchedAndWatchingCourses(userId) {
  const tagsOfWatchedAndWatchingCourses = [];
  const watchedOrWatchingCourses = await getWatchedOrWatchingCourses(userId);
  if (watchedOrWatchingCourses.length > 0) {
    const tagObjects = watchedOrWatchingCourses[0].tags;
    tagObjects.forEach(tagObject => {
      tagsOfWatchedAndWatchingCourses.push(tagObject.label);
    });
    return _.uniq(tagsOfWatchedAndWatchingCourses);
  }
  return [];
}

async function getAuthorsOfWatchedAndWatchingCourses(userId) {
  const watchedOrWatchingCourses = await getWatchedOrWatchingCourses(userId);
  const authorsOfWatchedAndWatchingCourses = watchedOrWatchingCourses
    .map(author => author.authors)
    .map(author => `${author[0].name} ${author[0].surname} ${author[0].email}`);
  const authorsOfWatchedAndWatchingCoursesWithEmail = _.uniq(authorsOfWatchedAndWatchingCourses);
  const authorsWithoutEmail = authorsOfWatchedAndWatchingCoursesWithEmail.map(authorWithEmail =>
    authorWithEmail.substring(0, authorWithEmail.lastIndexOf(' '))
  );
  return authorsWithoutEmail;
}

async function getTagsOfUnwatchedCourses(userId) {
  const unwatchedCourses = await getUnwatchedCourses(userId);
  const tagObjectsOfUnwatchedCourses = [];
  const unwatchedCoursesWithTags = new Map();
  unwatchedCourses.forEach(unwatchedCourse => {
    tagObjectsOfUnwatchedCourses.push(unwatchedCourse.tags);
  });
  for (let i = 0; i < tagObjectsOfUnwatchedCourses.length; i += 1) {
    const listOfTagsForCourse = [];
    const numberOfTagsForCourse = tagObjectsOfUnwatchedCourses[i].length;
    for (let j = 0; j < numberOfTagsForCourse; j += 1) {
      listOfTagsForCourse.push(tagObjectsOfUnwatchedCourses[i][j].label);
    }
    unwatchedCoursesWithTags[unwatchedCourses[i].title] = listOfTagsForCourse;
  }
  return unwatchedCoursesWithTags;
}

async function getRecommendedCourses(userId) {
  const tagsOfWatchedAndWatchingCourses = await getTagsOfWatchedAndWatchingCourses(userId);
  const unwatchedCourses = await getUnwatchedCourses(userId);
  const tagsOfUnwatchedCourses = await getTagsOfUnwatchedCourses(userId);
  const recommendedCourses = [];
  if (tagsOfWatchedAndWatchingCourses.length === 0) {
    return unwatchedCourses;
  }
  unwatchedCourses.forEach(unwatchedCourse => {
    for (let i = 0; i < tagsOfWatchedAndWatchingCourses.length; i += 1) {
      if (tagsOfUnwatchedCourses[unwatchedCourse.title].includes(tagsOfWatchedAndWatchingCourses[i])) {
        recommendedCourses.push(unwatchedCourse);
      }
    }
  });
  return _.uniq(recommendedCourses);
}

async function createMapOfCourseIdAndTitle() {
  const courses = await getCoursesWithLessons();
  const mapOfIdAndTitle = {};
  try {
    if (courses.length === 0) throw new Error('There are no courses available.');
    else {
      courses.forEach(course => {
        mapOfIdAndTitle[course.title] = course.id;
      });
    }
  } catch (err) {
    return err.message;
  }
  return mapOfIdAndTitle;
}

async function createMapOfFirstLessonIdAndCourseTitle() {
  const courses = await getCoursesWithLessons();
  const mapOfFirstLessonIdAndCourseTitle = {};
  try {
    if (courses.length === 0) throw new Error('There are no courses available.');
    else {
      courses.forEach(course => {
        mapOfFirstLessonIdAndCourseTitle[course.title] = course.lessons[0].id;
      });
    }
  } catch (err) {
    return err.message;
  }
  return mapOfFirstLessonIdAndCourseTitle;
}

async function getNumberOfPeopleWhoCompletedThisCourse(courseId) {
  const models = await initModels();
  const CompletedCourse = await models.getModel('completedcourse');
  const numberOfPeopleWhoCompletedThisCourse = await CompletedCourse.find({ courseId: courseId });
  if (!numberOfPeopleWhoCompletedThisCourse) {
    return 0;
  }
  return numberOfPeopleWhoCompletedThisCourse.length;
}

async function getNumberOfPeopleWhoCompletedCoursesByThisAuthor(authorId) {
  const courseTitlesByAuthor = await getCourseTitlesAuthoredByUser(authorId);
  const models = await initModels();
  const CompletedCourse = await models.getModel('completedcourse');

  const completedCourses = await CompletedCourse.find({});
  const listOfCompletedCoursesCreatedByAuthor = completedCourses.filter(completedCourse =>
    courseTitlesByAuthor.includes(completedCourse.courseName)
  );
  return listOfCompletedCoursesCreatedByAuthor.length;
}

async function getNumberOfPeopleWhoAreWatchingCoursesByThisAuthor(authorId) {
  const mapOfNumberOfPeopleWatchingCoursesByThisAuthor = await mapOfNumberOfPeopleWatchingCoursesByAuthor(authorId);
  return Object.keys(mapOfNumberOfPeopleWatchingCoursesByThisAuthor).reduce(
    (sum, title) => sum + mapOfNumberOfPeopleWatchingCoursesByThisAuthor[title],
    0
  );
}

async function courseStatisticsForAuthor(authorId) {
  const courseStats = new Map();
  const numberOfPeopleWhoAreWatchingCoursesByThisAuthor = await getNumberOfPeopleWhoAreWatchingCoursesByThisAuthor(
    authorId
  );
  const numberOfPeopleWhoCompletedCoursesByThisAuthor = await getNumberOfPeopleWhoCompletedCoursesByThisAuthor(
    authorId
  );
  courseStats.inProgress = numberOfPeopleWhoAreWatchingCoursesByThisAuthor;
  courseStats.completed = numberOfPeopleWhoCompletedCoursesByThisAuthor;
  return courseStats;
}

async function getNumberOfPeopleWhoCompletedCoursesForEveryCourse() {
  const models = await initModels();
  const Course = await models.getModel('course');
  const courses = await Course.find({});
  const mapOfCourseIdAndNumberOfPeopleWhoCompletedTheCourse = {};
  for (const course of courses) {
    mapOfCourseIdAndNumberOfPeopleWhoCompletedTheCourse[course.title] = await getNumberOfPeopleWhoCompletedThisCourse(
      course.id
    );
  }
  return mapOfCourseIdAndNumberOfPeopleWhoCompletedTheCourse;
}

async function getNumberOfPeopleWhoCompletedAndAreWatchingCourses() {
  const numberOfPeopleWhoCompletedCoursesForEveryCourse = await getNumberOfPeopleWhoCompletedCoursesForEveryCourse();
  const numberOfPeopleWatchingACourse = await mapOfNumberOfPeopleWatchingACourse();
  const courses = await getCoursesWithLessons();
  const numberOfPeopleWhoCompletedAndAreWatchingCourses = {};
  for (const course of courses) {
    numberOfPeopleWhoCompletedAndAreWatchingCourses[course.title] =
      numberOfPeopleWhoCompletedCoursesForEveryCourse[course.title] + numberOfPeopleWatchingACourse[course.title];
  }
  return numberOfPeopleWhoCompletedAndAreWatchingCourses;
}

async function getMostPopularCourses(numberOfCourses) {
  const models = await initModels();
  const Course = await models.getModel('course');
  const numberOfPeopleWhoCompletedAndAreWatchingCourses = await getNumberOfPeopleWhoCompletedAndAreWatchingCourses();
  const listOfTitlesOfPopularCourses = [];
  const popularCourses = [];
  const listOfMostPopularCourses = Object.entries(numberOfPeopleWhoCompletedAndAreWatchingCourses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numberOfCourses);
  for (let i = 0; i < listOfMostPopularCourses.length; i += 1) {
    listOfTitlesOfPopularCourses.push(listOfMostPopularCourses[i][0]);
  }
  for (let i = 0; i < listOfTitlesOfPopularCourses.length; i += 1) {
    const popularCourse = await Course.findOne({ title: listOfTitlesOfPopularCourses[i] });
    popularCourses.push(popularCourse[0]);
  }
  return popularCourses;
}

async function getMostPopularCoursesOfAuthor(userId) {
  const coursesAuthoredByThisUser = await getCoursesAuthoredByUser(userId);
  const models = await initModels();
  const Course = await models.getModel('course');
  const numberOfPeopleWhoCompletedAndAreWatchingCoursesOfAuthor = new Map();
  const numberOfPeopleWhoCompletedAndAreWatchingCourses = await getNumberOfPeopleWhoCompletedAndAreWatchingCourses();
  for (const course of coursesAuthoredByThisUser) {
    if (numberOfPeopleWhoCompletedAndAreWatchingCourses.hasOwnProperty(course.title)) {
      numberOfPeopleWhoCompletedAndAreWatchingCoursesOfAuthor[course.title] =
        numberOfPeopleWhoCompletedAndAreWatchingCourses[course.title];
    }
  }
  const listOfTitlesOfPopularCoursesOfAuthor = [];
  const popularCoursesOfAuthor = [];
  let listOfMostPopularCoursesOfAuthor = [];
  listOfMostPopularCoursesOfAuthor = Object.entries(numberOfPeopleWhoCompletedAndAreWatchingCoursesOfAuthor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (let i = 0; i < listOfMostPopularCoursesOfAuthor.length; i += 1) {
    listOfTitlesOfPopularCoursesOfAuthor.push(listOfMostPopularCoursesOfAuthor[i][0]);
  }
  for (let i = 0; i < listOfTitlesOfPopularCoursesOfAuthor.length; i += 1) {
    const popularCourseOfAuthor = await Course.find({ title: listOfTitlesOfPopularCoursesOfAuthor[i] });
    popularCoursesOfAuthor.push(popularCourseOfAuthor[0]);
  }
  return popularCoursesOfAuthor;
}

async function getMostRecentCoursesByAuthor(authorId, numberOfCourses) {
  const activeCoursesByAuthor = await getActiveCoursesAuthoredByUser(authorId);
  if (!activeCoursesByAuthor || activeCoursesByAuthor.length === 0) {
    return [];
  }
  const mostRecentCourses = activeCoursesByAuthor.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, numberOfCourses);
  return mostRecentCourses;
}

async function getMaximumYValueForQuickStatsGraph() {
  const numberOfPeopleWhoCompletedAndAreWatchingCourses = await getNumberOfPeopleWhoCompletedAndAreWatchingCourses();
  if (
    !numberOfPeopleWhoCompletedAndAreWatchingCourses ||
    numberOfPeopleWhoCompletedAndAreWatchingCourses === undefined ||
    numberOfPeopleWhoCompletedAndAreWatchingCourses.length === 0
  ) {
    return 0;
  }
  const maxValueForYAxis = Math.max.apply(null, Object.values(numberOfPeopleWhoCompletedAndAreWatchingCourses));
  const remainderOfMaxValueForYAxisDividedByFour = maxValueForYAxis % 4;
  let maxValueForYAxisDivisibleByFour;
  switch (remainderOfMaxValueForYAxisDividedByFour) {
    case 0:
      maxValueForYAxisDivisibleByFour = maxValueForYAxis;
      break;
    case 1:
      maxValueForYAxisDivisibleByFour = maxValueForYAxis + 3;
      break;
    case 2:
      maxValueForYAxisDivisibleByFour = maxValueForYAxis + 2;
      break;
    case 3:
      maxValueForYAxisDivisibleByFour = maxValueForYAxis + 1;
      break;
    default:
      maxValueForYAxisDivisibleByFour = maxValueForYAxis;
      break;
  }
  return maxValueForYAxisDivisibleByFour;
}

async function getYValuesForQuickStatsGraph() {
  const maxYValue = await getMaximumYValueForQuickStatsGraph();
  if (maxYValue === 0 || maxYValue === undefined || !maxYValue || maxYValue === -Infinity) {
    return [0, 1, 2, 3, 4];
  }
  const listOfYValues = new Array(5);
  listOfYValues[0] = 0;
  listOfYValues[1] = maxYValue * 0.25;
  listOfYValues[2] = maxYValue * 0.5;
  listOfYValues[3] = maxYValue * 0.75;
  listOfYValues[4] = maxYValue;
  return listOfYValues;
}

async function getFavouriteCourseStatus(userId, courseId) {
  const models = await initModels();
  const Favourite = models.getModel('favourite');
  const favourite = await Favourite.findOrCreate(
    {
      courseId: courseId,
      userId: userId
    },
    {
      courseId: courseId,
      userId: userId,
      status: 0
    }
  );

  return favourite;
}

async function getFavouriteCourses(userId) {
  const models = await initModels();
  const Favourite = models.getModel('favourite');
  const favourites = await Favourite.find({
    userId: userId
  });
  return favourites;
}

async function getNumberOfFavouriteCourses(userId) {
  const coursesAuthoredByUser = await getCoursesAuthoredByUser(userId);
  const models = await initModels();
  const Favourite = models.getModel('favourite');
  const favourites = await Favourite.find({});
  let numberOfFavouriteCoursesForAuthor = 0;
  const coursesId = [];

  coursesAuthoredByUser.forEach(course => {
    coursesId.push(course.id);
  });

  favourites.forEach(favourite => {
    for (let counter = 0; counter < coursesId.length; counter += 1) {
      if (favourite.courseId === coursesId[counter] && favourite.status === 1) {
        numberOfFavouriteCoursesForAuthor += 1;
      }
    }
  });

  return numberOfFavouriteCoursesForAuthor;
}

async function addCompletedCourse(completedCourse) {
  const models = await initModels();
  const CompletedCourse = models.getModel('completedcourse');

  await CompletedCourse.create(completedCourse).fetch();
}

async function findUsersThatCompletedACourse() {
  const models = await initModels();
  const User = models.getModel('user');
  const CompletedCourse = models.getModel('completedcourse');
  const usersThatCompletedACourse = [];
  const completedCourses = await CompletedCourse.find();

  for (let counter = 0; counter < completedCourses.length; counter += 1) {
    const userThatCompletedACourse = await User.find({ id: completedCourses[counter].userId });
    usersThatCompletedACourse.push({
      userThatCompletedACourse: userThatCompletedACourse[0],
      courseId: completedCourses[counter].courseId
    });
  }
  return usersThatCompletedACourse;
}

async function findUsersThatCompletedAuthoredCourses(user) {
  const coursesAuthoredByUser = await getActiveCoursesAuthoredByUser(user.id);
  const usersThatCompletedACourse = await findUsersThatCompletedACourse();
  const usersThatCompletedAuthoredCourses = [];

  usersThatCompletedACourse.forEach(userThatCompletedACourse => {
    for (let counter = 0; counter < coursesAuthoredByUser.length; counter += 1) {
      if (userThatCompletedACourse.courseId === coursesAuthoredByUser[counter].id) {
        const userThatCompletedAuthoredCourses = {
          user: userThatCompletedACourse.userThatCompletedACourse,
          course: coursesAuthoredByUser[counter]
        };
        usersThatCompletedAuthoredCourses.push(userThatCompletedAuthoredCourses);
      }
    }
  });

  return usersThatCompletedAuthoredCourses;
}

async function updateCourseWhenLessonIsEdited(lessonId, courseId) {
  const models = await initModels();
  const Course = models.getModel('course');
  const Lesson = models.getModel('lesson');
  const lesson = await Lesson.find({ id: lessonId });
  await Course.update({ id: courseId }).set({ updatedAt: lesson.updatedAt });
}

async function getDateOfFirstAccessForCourse(courseId, userId) {
  const models = await initModels();
  const LessonProgress = models.getModel('lessonprogress');
  const lessonProgress = await LessonProgress.find({
    courseId: courseId,
    user: userId
  });
  if (lessonProgress.length > 1) {
    const listOfAccessDates = lessonProgress.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    return listOfAccessDates[0].date;
  } else if (lessonProgress.length === 1) {
    return lessonProgress[0].date;
  }
  return '';
}

async function getDateOfLastAccessForCourse(courseId, userId) {
  const models = await initModels();
  const LessonProgress = models.getModel('lessonprogress');
  const lessonProgress = await LessonProgress.find({
    courseId: courseId,
    user: userId
  });
  if (lessonProgress.length > 1) {
    const listOfAccessDates = lessonProgress.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });
    return listOfAccessDates[0].date;
  } else if (lessonProgress.length === 1) {
    return lessonProgress[0].date;
  }
  return '';
}

async function getNumberOfQuizzesForThisCourse(courseId) {
  const models = await initModels();
  const TrueOrFalseQuestion = models.getModel('trueorfalsequestion');
  const MultipleChoiceQuestion = models.getModel('multiplechoicequestion');
  const trueOrFalseQuestions = await TrueOrFalseQuestion.find({ courseId: courseId });
  const multipleChoiceQuestions = await MultipleChoiceQuestion.find({ courseId: courseId });
  const numberOfTrueOrFalseQuestions = trueOrFalseQuestions.length;
  const numberOfMultipleChoiceQuestions = multipleChoiceQuestions.length;
  const totalNumberOfQuizzes = parseInt(numberOfTrueOrFalseQuestions + numberOfMultipleChoiceQuestions, 10);
  return totalNumberOfQuizzes;
}

async function getAllUsersAssociatedWithThisCourse(courseTitle) {
  const models = await initModels();
  const User = models.getModel('user');
  const Course = models.getModel('course');
  const thisCourse = await Course.findOne({ title: courseTitle }).populate('lessons');
  const numberOfQuizzesForThisCourse = await getNumberOfQuizzesForThisCourse(thisCourse.id);
  const numberOfLessonsForThisCourse = thisCourse.lessons.length;
  const allUsers = await User.find({});
  const usersAssociatedWithThisCourse = [];
  for (let i = 0; i < allUsers.length; i += 1) {
    const userIsAssociatedWithThisCourse = await isWatchedOrWatchingCourse(allUsers[i].id, courseTitle);
    const userAlreadyCompletedThisCourse = await courseIsCompletedByUser(allUsers[i].id, courseTitle);
    const numberOfLessonsCompletedForThisCourse = await getNumberOfCompletedLessonsForThisCourse(
      allUsers[i].id,
      thisCourse.id
    );
    const numberOfIncompleteLessons = parseInt(
      numberOfLessonsForThisCourse - numberOfLessonsCompletedForThisCourse,
      10
    );
    const percentageOfIncompleteLessons = parseInt(
      (numberOfIncompleteLessons / numberOfLessonsForThisCourse) * 100,
      10
    );
    const percentageOfCompletedLessons = parseInt(100 - percentageOfIncompleteLessons, 10);
    const dateOfFirstAccess = await getDateOfFirstAccessForCourse(thisCourse.id, allUsers[i].id);
    const dateOfLastAccess = await getDateOfLastAccessForCourse(thisCourse.id, allUsers[i].id);
    if (userIsAssociatedWithThisCourse) {
      if (userAlreadyCompletedThisCourse) {
        const userDetailsForCourse = Object.assign(
          {},
          { status: 'Complete' },
          { name: allUsers[i].name },
          { surname: allUsers[i].surname },
          { enrolled: dateOfFirstAccess },
          { lastAccess: dateOfLastAccess },
          { numberOfQuizzes: numberOfQuizzesForThisCourse },
          { completedLessons: numberOfLessonsForThisCourse },
          { completedLessonsPercentage: 100 },
          { incompleteLessons: numberOfIncompleteLessons },
          { incompleteLessonsPercentage: 0 }
        );
        usersAssociatedWithThisCourse.push(userDetailsForCourse);
      } else {
        const userDetailsForCourse = Object.assign(
          {},
          { status: 'In progress' },
          { name: allUsers[i].name },
          { surname: allUsers[i].surname },
          { enrolled: dateOfFirstAccess },
          { lastAccess: dateOfLastAccess },
          { numberOfQuizzes: numberOfQuizzesForThisCourse },
          { completedLessons: numberOfLessonsCompletedForThisCourse },
          { completedLessonsPercentage: percentageOfCompletedLessons },
          { incompleteLessons: numberOfIncompleteLessons },
          { incompleteLessonsPercentage: percentageOfIncompleteLessons }
        );
        usersAssociatedWithThisCourse.push(userDetailsForCourse);
      }
    }
  }
  return usersAssociatedWithThisCourse;
}

module.exports = {
  findCourseByTitle,
  findUsersThatCompletedAuthoredCourses,
  getCoursesWithLessons,
  findAllCourses,
  findOneCourse,
  findCourseByAuthor,
  findCoursesByTag,
  findUsersAndTheirCompletedCourses,
  findUsersWithProgress,
  saveLatestCourseCompleted,
  findUserAndCompletedCoursesFromDb,
  findCoursesWithUserProgress,
  addTagToCourse,
  addAuthorToCourse,
  assignAuthorToCourse,
  findCourseWithTittle,
  sendEmailWhenCourseIsCompleted,
  getTitlesOfCourses,
  getTagsOfCourses,
  getAuthorsOfCourses,
  getTitlesTagsAndAuthorsOfCourses,
  twoDigitFormat,
  getTitlesOfWatchedAndWatchingCourses,
  getAuthorsOfWatchedAndWatchingCourses,
  getTagsOfWatchedAndWatchingCourses,
  getRecommendedCourses,
  isTagOfCourse,
  isAuthorOfCourse,
  isWatchedOrWatchingCourse,
  getTagsOfOneCourse,
  selectOneRandomCourse,
  randomiseCourses,
  createMapOfCourseIdAndTitle,
  createMapOfFirstLessonIdAndCourseTitle,
  getCoursesAuthoredByUser,
  getNumberOfPeopleWhoCompletedThisCourse,
  getNumberOfPeopleWhoCompletedCoursesForEveryCourse,
  userCompletedThisCourse,
  getNumberOfPeopleWatchingThisCourse,
  mapOfNumberOfPeopleWatchingACourse,
  getFavouriteCourseStatus,
  getFavouriteCourses,
  getNumberOfPeopleWhoCompletedCoursesByThisAuthor,
  getNumberOfPeopleWhoAreWatchingCoursesByThisAuthor,
  getNumberOfPeopleWhoCompletedAndAreWatchingCourses,
  getMaximumYValueForQuickStatsGraph,
  getNumberOfFavouriteCourses,
  getYValuesForQuickStatsGraph,
  getMostPopularCourses,
  getMostPopularCoursesOfAuthor,
  addCompletedCourse,
  getActiveCoursesAuthoredByUser,
  getArchivedCoursesByUser,
  courseStatisticsForAuthor,
  updateCourseWhenLessonIsEdited,
  getMostRecentCoursesByAuthor,
  getAllUsersWatchingThisCourse,
  getAllUsersWhoCompletedThisCourse,
  getAllUsersAssociatedWithThisCourse,
  getDateOfLastAccessForCourse
};
