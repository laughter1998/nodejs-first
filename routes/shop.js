const router = require('express').Router();

router.use(isLogin);

function isLogin(req, res, next){
    console.log(req.user);
    if(req.user){
        next();
    } else {
        res.send('로그인 안했음');
    }
}



router.get('/shirts', function(req, res){
    res.send("셔츠 파는 페이지입니다.");
});

router.get('/pants', function(req, res){
    res.send("바지 파는 페이지입니다.");
});


module.exports = router;