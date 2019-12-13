
exports.func = async function migrate(models) {
  const User = models.getModel('user');
  
  // users/authors
  await User.create({
    email: 'cersei@casterlyrock.com',
    name: 'Cersei',
    surname: 'Lannister',
    image: 'http://localhost:3005/uploads/cersei.jpg',
  });

  await User.create({
    email: 'jon@thewall.com',
    name: 'Jon',
    surname: 'Snow',
    image: 'http://localhost:3005/uploads/jon.jpg',
  });

  await User.create({
    email: 'dany@dragonstone.com',
    name: 'Danaerys',
    surname: 'Targaryen',
    image: 'http://localhost:3005/uploads/dany.jpg',
  });

  await User.create({
    email: 'albus@hogwarts.com',
    name: 'Albus',
    surname: 'Dumbledore',
    image: 'http://localhost:3005/uploads/dumbledore.jpg',
  });

  await User.create({
    email: 'severus@hogwarts.com',
    name: 'Severus',
    surname: 'Snape',
    image: 'http://localhost:3005/uploads/snape.png',
  });
};
