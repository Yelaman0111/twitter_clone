exports.requireLogin = (req, res, next) => {
    if(req.session && req.sesion.user){
        return next();
    }
    else {
        return res.redirect('/login');
    }
}