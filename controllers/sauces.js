const Sauce = require('../models/sauces');
const fs = require ('fs')


/*fonction de création du produit*/

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
 };


 /*fonction pour récupérer tous les produits*/

  exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauce=> res.status(200).json(sauce))
      .catch(error => res.status(400).json({ error }));

  }; 

/*fonction pour récupérer un seul produit*/

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));

  };

/* fonction pour supprimer un produit*/

  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };


 /*fonction pour modifier un produit*/

  exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 /* fonction pour les likes*/


 exports.like = (req, res, next) => {
  const userId = req.body.userId;
  const sauceId = req.params.id;

  if (req.body.like == 1) {
    Sauce.updateOne(
      { _id: sauceId },
      { $inc: { likes: 1 }, $push: { usersLiked: userId } }
    )
      .then(() => res.status(200).json({ message: "Vous aimez cette sauce !" }))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like == -1) {
    Sauce.updateOne(
      { _id: sauceId },
      { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } }
    )
      .then(() =>
        res.status(200).json({ message: "Vous n'aimez pas cette sauce !" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like == 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $inc: { likes: -1 }, $pull: { usersLiked: userId } }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: "Vous n'aimez plus cette sauce !" })
            )
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } }
          )
            .then(() => res.status(200).json({ message: "Plus de dislike !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};