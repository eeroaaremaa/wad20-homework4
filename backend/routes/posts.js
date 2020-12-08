const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize,  (request, response) => {

    // Endpoint to create a new post
    let media = {
        url: request.body.media.url,
        type: request.body.media.type
    }
    let params = {
        userId: request.currentUser.id,
        text: request.body.text,
        media
    };

    const fieldMissing = {
        code: null,
        message: 'Please provide %s field'
    };

    for (let field in params) {
        if (params[field].required === true && !request.body[field]) {

            fieldMissing.code = field;
            fieldMissing.message = fieldMissing.message.replace('%s', field);

            response.json(fieldMissing, 400);
            return;
        }
    }

    PostModel.create(params, () => {
        response.status(201).json()
    });
});


router.put('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to like a post
    let userId = request.currentUser.id;

    PostModel.like(userId, request.params.postId, () => {
        response.status(201).json()
    });
});

router.delete('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to unlike a post
    let userId = request.currentUser.id;

    PostModel.unlike(userId, request.params.postId, () => {
        response.status(201).json()
    });
});

module.exports = router;
