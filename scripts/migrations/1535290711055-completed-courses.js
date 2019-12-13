const { addCompletedCourse } = require('../../services/courseService');

exports.func = async function migrate(models) {
  const Course = models.getModel('course');
  const User = models.getModel('user');

  const learningImportantAlgorithms = await Course.findOne({ title: 'Learning Important Algorithms' });
  const basicsOfReactjs = await Course.findOne({ title: 'Basics of React js' });
  const applicationsWithAngular = await Course.findOne({ title: 'Applications with Angular 7' });
  const typescript = await Course.findOne({ title: 'Learning Typescript' });
  const design = await Course.findOne({ title: 'Principles of Design' });
  const jon = await User.findOne({ name: 'Jon' });
  const cersei = await User.findOne({ name: 'Cersei' });
  const albus = await User.findOne({ name: 'Albus' });
  const severus = await User.findOne({ name: 'Severus' });

  await addCompletedCourse({
    courseId: learningImportantAlgorithms.id,
    userId: albus.id,
    username: albus.name,
    courseName: learningImportantAlgorithms.title,
    date: 'Mon Sep 02 2019',
    image: learningImportantAlgorithms.image,
  });

  await addCompletedCourse({
    courseId: basicsOfReactjs.id,
    userId: severus.id,
    username: severus.name,
    courseName: basicsOfReactjs.title,
    date: 'Mon Sep 02 2019',
    image: basicsOfReactjs.image,
  });

  await addCompletedCourse({
    courseId: applicationsWithAngular.id,
    userId: severus.id,
    username: severus.name,
    courseName: applicationsWithAngular.title,
    date: 'Mon Sep 02 2019',
    image: applicationsWithAngular.image,
  });

  await addCompletedCourse({
    courseId: learningImportantAlgorithms.id,
    userId: jon.id,
    username: jon.name,
    courseName: learningImportantAlgorithms.title,
    date: 'Wed Sep 04 2019',
    image: learningImportantAlgorithms.image,
  });

  await addCompletedCourse({
    courseId: typescript.id,
    userId: cersei.id,
    username: cersei.name,
    courseName: typescript.title,
    date: 'Thu Sep 05 2019',
    image: typescript.image,
  });

  await addCompletedCourse({
    courseId: design.id,
    userId: jon.id,
    username: jon.name,
    courseName: design.title,
    date: 'Fri Sep 06 2019',
    image: design.image,
  });
};
