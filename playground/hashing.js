const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = 'abcdedf123!';

bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,(err,hash)=>{
        console.log(hash);
    })
})

var hassedpsw = '$2a$10$l5WC7nADwcR.mfjiFT8r0O5ABJUz75BTZaYtuOHK2Eog.AB3RZizi';

bcrypt.compare(password,hassedpsw,(err,result)=>{
    console.log(result);
})


// var data = {
//     id: 10
// };

// var token = jwt.sign(data,'abc123');

// console.log(token);

// var decoded = jwt.verify(token,'abc123');

// console.log(decoded);