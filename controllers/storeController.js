const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.myMiddleware = (req, res, next) => {
  req.name = 'Ricardo';
  next();
};


exports.homePage = (req, res) => {
  console.log(req.name);
  req.flash('error', 'Something happened');
  res.render('index');    
};

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add STore'});
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  // 1. Query db for list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores: stores });
}

exports.editStore = async(req, res) => {
  // 1. Find store with given id
  const store = await Store.findOne({ _id: req.params.id }); 
  //res.json(store);
  // 2. Confirm user is owner of store
  // TODO
  // 3. Render edit form for update
  res.render('editStore', { title: `Edit ${store.name}`, store: store });
}

exports.updateStore = async(req, res) => {
  // set location data to be a point
  req.data.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return new store instead of old store
    runValidators: true // validate against schema
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store </a>`)
  // redirect to store and flash success
  res.redirect(`/stores/${store._id}/edit`);
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  .find({
    $text: {
      $search: req.query.q
    } 
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({
    score: { $meta: 'textScore'}
  })
  .limit(5);
  res.json(stores);
}