const router = require('express').Router();

router.get('/sub/sports', function(req, res){
    res.send("스포츠 게시판");
});

router.get('/sub/game', function(req, res){
    res.send("게임게시판");
})

module.exports = router;