// const { response } = require('express');
require('dotenv').config();
const express = require('express');
const app = express();

// Socket.io 셋팅방법
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);
// Socket.io 셋팅방법


app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


const MongoClient = require('mongodb').MongoClient;

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');

var db;

MongoClient.connect(process.env.DB_URL, function(error, client){

    if(error) return console.log(error) ;

    db = client.db('todoapp');

    /*
    db.collection('post').insertOne({이름 : 'John', 나이 : 20, _id: 100}, function(에러, 결과){
        console.log('저장완료');
    });
    */

    http.listen(8080, function(){ // Socket.io 셋팅방법
    // app.listen(8080, function(){
        console.log('listening on 8080');
    });

})

const {ObjectId} = require('mongodb');

app.get('/socket',function(req, res){
    res.render('socket.ejs')
});
io.on('connection', function(socket){
    console.log('유저접속됨');

    // socket.join('room1');
    socket.on('room1-send', function(data){
        io.to('room1').emit('broadcast', data); // 전체
    });

    socket.on('joinroom', function(data){
        socket.join('room1');
    });

    socket.on('user-send', function(data){
        console.log(socket.id);
        io.emit('broadcast', data); // 전체
        // io.to(socket.id).emit('broadcast', data); // 서버-유저1명간
    });
    
});

app.get('/pet',function (요청, 응답) {
    응답.send('펫용품 쇼핑할 수 있는 페이지');
});
app.get('/beuaty',function (req, response) {
    response.send('뷰티용품 쇼핑할 수 있는 페이지');
})
app.get('/',function (req, response) {
    response.render(__dirname + '/views/index.ejs');
})


let multer = require('multer');
let path = require('path');

var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './public/image');
    },
    filename : function(req, file, cb){
        cb(null, file.originalname );
    }
});

var upload = multer({
    storage : storage,
    fileFilter : function(req, file, callback){
        var ext = path.extname(file.originalname);
        if(ext !== '.jpg' && ext !== '.jpeg'){
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits : {
        fileSize: 1024 * 1024
    }
});


app.get('/upload', function(req, res){
    res.render('upload.ejs');
})

app.post('/upload', upload.single('profile'), function(req, res){
    res.send('업로드 오나료');
});

app.get('/image/:imgName', function(req, res){
    res.sendFile(__dirname + '/public/image' + req,params.imgName);
})

app.get('/list', function(req, response){
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        response.render('list.ejs',{posts : result});
    });
});
app.post('/list', function(req, response){
    db.collection('post').find({"제목": req.body.search}).toArray(function(error, result){
        console.log(result);
        response.render('list.ejs',{posts : result});
    })
});


app.get('/detail/:id',function(req, res){
    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(error, result){
        console.log(result);
        res.render('detail.ejs',{ data : result});
    })
});

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(error, result){
        
        res.render('edit.ejs',{post : result});
    })
})

app.put('/modeify/:id', function(req, res){
    // console.log(req.body);
    res.send('전송완료');
     db.collection('post').updateOne({_id: parseInt(req.params.id)},{$set:{"제목": req.body.title, "날짜":  req.body.date}})
});

app.put('/edit', function(req, res){
    db.collection('post').updateOne({_id: parseInt(req.body.id)},{$set:{"제목": req.body.title, "날짜": req.body.date}}, function(error, result){
        res.redirect('/list');
    })
})




const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { Socket } = require('socket.io');

app.use(session({secret: '비밀코드' , resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    failureRedirent : '/fail'
}) ,function(req, res){
    res.redirect('/');
});

app.get('/join', function(req, res){
    res.render('join.ejs')
});

app.post('/join',function(req, res){
    console.log(req.body);
    db.collection('login').insertOne({id: req.body.id, pw : req.body.pw}, function(error, result){
        res.redirect('/login');
    })
});



app.get('/write',isLogin ,function (req, response) {
    response.render(__dirname + '/views/write.ejs', {writer: req.user});
});

//chat
app.get('/chat', isLogin, function(req, res){
    db.collection('chatroom').find({member :req.user._id}).toArray()
    .then((result)=>{
        res.render('chat.ejs', {data : result});
    })
});

app.post('/message', isLogin, function(req, res){
    console.log("1");
    var data = {
        parent: req.body.parent,
        content: req.body.content,
        userid : req.user._id,
        data : new Date()
    }
    console.log(data);
    db.collection('message').insertOne(data)
    .then((result)=>{
        console.log("성공");
        res.send(result);
    })
    .catch(()=>{
        console.log("저장 실패");
    })
})

app.post('/chatroom', isLogin,function(req, res){
    console.log(req.body);
    console.log(req.user);
    const data = {
        title : '11',
        member : [ObjectId(req.body.당한사람id), req.user._id],
        data : new Date()
    }
    db.collection('chatroom').insertOne(data)
    .then((result)=>{
        result.send("ㅇㅇ");
    })
});




app.get('/mypage', isLogin,function(req, res){

    console.log(req.user);
    res.render('mypage.ejs', {사용자 : req.user});
});

app.get('/search', (req, res)=>{
    var searchCondition = [
        {
            $search: {
              index: 'titleSearch',
              text: {
                query: req.query.value,
                path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
              }
            }
        },
        {$project : {제목:1, _id: 0, score : {$meta : "searchScore"}}}
        // {$sort : {_id : 1}},
        // {$limit : 10}
    ]
    console.log("req.query.value");
    // db.collection('post').find({제목: req.query.value}).toArray((error, result)=>{
    // db.collection('post').find({ $text : { $search: req.query.value }}).toArray((error, result)=>{
    db.collection('post').aggregate(searchCondition).toArray((error, result)=>{
        console.log(result);
        res.render('search.ejs',{result : result});
    })
})


function isLogin(req, res, next){
    if(req.user){
        next();
    } else {
        res.send('로그인 안했음');
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러);
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과);
      } else {
        return done(null, false, { message: '비번틀렸어요' });
      }
    })
  }));

  passport.serializeUser(function(user, done){
      done(null, user.id);
  });
  passport.deserializeUser(function(아이디, done){
      db.collection('login').findOne({id: 아이디}, function(error, result){
          done(null, result)
      })
  });


app.post('/register', resigterId ,function(req, res){

    db.collection('login').insertOne({id: req.body.id, pw : req.body.pw}, function(error, result){
        res.redirect('/login');
    })
});
function resigterId(req, res, next) {
    db.collection('login').findOne({id: req.body.id}, function(error, result){

        if (result) {
            res.send('이미 가입 했음');
        } else {
            next();
        }
    })
}

app.post('/add', (req, response)=>{
    response.send('전송완료');
    db.collection('counter').findOne({name : '게시물 개수'}, function(error, result){
        console.log(result.totalPost);
        var totalNum =  result.totalPost;
        const inputData = {_id: totalNum + 1 , 제목 : req.body.title, 날짜 : req.body.date, 작성자 : req.user._id};
        db.collection('post').insertOne(inputData, function(에러, 결과){
            console.log('저장완료');
            db.collection('counter').updateOne({name:'게시물 개수'},{ $inc : {totalPost:1}},function(error, result){
                if(error) console.log(error);
                console.log('업데이트 완료')
            })
        });


    });
    // console.log(req.body);
});

app.delete('/delete', function (req, res) {
    console.log(req.body) ;
    req.body._id = parseInt(req.body._id);
 
     var deleteData = {_id : req.body._id, 작성자 : req.user._id}
 
    db.collection('post').deleteOne(deleteData ,function(error, result){
         console.log("삭제");
         if(error) {
             console.log(error);
         }
         res.status(200).send({message : '성공했습니다.'});
    })
 });

 app.use('/shop', require('./routes/shop.js'));
 app.use('/board',  require('./routes/board.js'));

app.get('/message/:id', isLogin, function(req, res){
    res.writeHead(200, {
        "Connection" : "keep-alive",
        "Content-Type" : "text/event-stream",
        "Cache-Control" : "no-cache"
    });
    db.collection('message').find({ parent: req.params.id}).toArray()
    .then((result)=>{
        res.write('event: test\n');
        res.write('data: ' + JSON.stringify(result) + '\n\n');
    })
    
    const pipeline = [
        {$match: { 'fullDocument.parent' : req.params.id}}
    ];
    const collection = db.collection('message');
    const changeStream = collection.watch(pipeline);
    changeStream.on('change', (result)=>{
        console.log(result.fullDocument);
        res.write('event: test\n');
        res.write('data: ' + JSON.stringify([result.fullDocument]) + '\n\n');
    });

});