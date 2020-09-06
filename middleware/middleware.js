const User = require('../models/user');

let middlewareObj = {};

middlewareObj.checkUserOwnership = async (req, res, next)=> {
    // Is user logged in ?
    if(req.isAuthenticated()){
        let foundUser ; 
        try{
            foundUser = await User.findById(req.params.id);
        }
        catch(err){
            return res.status(500).json({ message: 'Could not update user' });
        }
        
        // Does User own this page ?
        if (!foundUser) {
            return res.status(500).json({ message: 'Error in updating user' });
        }
        if(foundUser._id.equals(req.user._id))
        {
            next(); 
        }
        else {
            return res.status(400).json({ error: 'You do not have permission to do that' });      
        }
    }    
    else {
        return res.status(400).json({ error: 'You do not have permission to do that!' });      
    } 
    
}


 module.exports = middlewareObj ; 