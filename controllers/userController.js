const mongoose = require('mongoose')
const User = mongoose.model('User')
const sha256 = require('js-sha256')
const jwt = require('jwt-then')

exports.register = async (req, res) => {
    const {name, email, password} = req.body;

    const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com|@outlook.com$/

    if (!emailRegex.test(email)) throw 'Email do seu domínio não é suportado'
    if (password.length < 6) throw 'Senha deve ter no mínimo 6 caracteres'

    const userExists = await User.findOne({ 
        email
    })

    if (userExists) throw 'Usuário com o mesmo email já cadastrado'

    const user = new User({
        name,
        email,
        password: sha256(password + process.env.ENCRYPT)
    })

    await user.save();

    res.json({
        message: 'Usuário [' + name + '] cadastrado com sucesso'
    })
}

exports.login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({
        email,
        password: sha256(password + process.env.ENCRYPT)
    })

    if (!user) throw 'Email e/ou senhas estão incorretos'

    const token = await jwt.sign({id: user.id}, process.env.SECRET)

    res.json({
        message: 'Usuário logado com sucesso!',
        token
    })
}