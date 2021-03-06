const { addLesson } = require('../../services/lessonService');
const LessonTypes = require('../../models/LessonTypes');

exports.func = async function migrate(models) {
  const Course = models.getModel('course');
  const Tag = models.getModel('tag');
  const User = models.getModel('user');

  const course = await Course.create({
    title: 'Applications with Angular 7',
    image: 'http://localhost:3005/uploads/Manabu_Angular_round_icon.png',
    rating: 4.2,
    description:
        'In this short course, we shall build a simple to-do list using Angular 7 and typescript.',
  }).fetch();

  const jon = await User.findOne({ name: 'Jon' });
  const danaerys = await User.findOne({ name: 'Danaerys' });
  const albus = await User.findOne({ name: 'Albus' });
  const allAuthors = [jon, danaerys, albus];

  const typescript = await Tag.findOne({ label: 'Typescript' });
  const singlePageApplications = await Tag.findOne({ label: 'Single Page Applications' });
  const programming = await Tag.findOne({ label: 'Programming' });
  const allTags = [typescript, singlePageApplications, programming];

  await Course.addToCollection(course.id, 'authors', allAuthors.map(a => a.id));
  await Course.addToCollection(course.id, 'tags', allTags.map(t => t.id));

  await addLesson({
    title: 'Single Page Applications',
    type: LessonTypes.VIDEO,
    source: 'http://localhost:3005/uploads/5dea3c1cfa6ae0c4cf9495c4-5df106e276a23c582d0ecfc2.mp4',
    course: course.id,
    durationInSeconds: 134,
    order: 1000,
    markdown:
      'Why have single page applications become so popular in recent years?',
  }, allAuthors, allTags);
};
