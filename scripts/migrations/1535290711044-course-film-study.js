const { addLesson } = require('../../services/lessonService');
const LessonTypes = require('../../models/LessonTypes');

exports.func = async function migrate(models) {
  const Course = models.getModel('course');
  const Tag = models.getModel('tag');
  const User = models.getModel('user');

  const course = await Course.create({
    title: 'Film Study',
    image: 'http://localhost:3005/uploads/Manabu_round_icon_extra06.png',
    rating: 4.8,
    description:
        'Have you ever wanted to have a more firm understanding of film criticism? Well then, this course is for you!',
  }).fetch();

  const cersei = await User.findOne({ name: 'Cersei' });
  const albus = await User.findOne({ name: 'Albus' });
  const allAuthors = [cersei, albus];

  const visualEffects = await Tag.findOne({ label: 'Visual Effects' });
  const comprehension = await Tag.findOne({ label: 'Comprehension' });
  const allTags = [visualEffects, comprehension];

  await Course.addToCollection(course.id, 'authors', allAuthors.map(a => a.id));
  await Course.addToCollection(course.id, 'tags', allTags.map(t => t.id));

  await addLesson({
    title: 'History of Film',
    type: LessonTypes.VIDEO,
    source: 'http://localhost:3005/uploads/5dea3c1cfa6ae0c4cf9495c4-5df106e276a23c582d0ecfc2.mp4',
    course: course.id,
    durationInSeconds: 638,
    order: 0,
    markdown:
      'Film history from the late 19th century.',
  }, allAuthors, allTags);
};
