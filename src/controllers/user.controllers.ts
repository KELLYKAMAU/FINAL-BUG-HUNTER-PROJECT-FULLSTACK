import {Request, Response} from 'express';
import * as userService from '../services/user.service';



export const getUsers = async (req:Request, res:Response) => {
    try {
        const users = await userService.listUsers();
        res.status(200).json(users);
    } catch (error: any) {
       res.status(500).json({ message: error.message });

    }
};


//get user by id
export const getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
        const user = await userService.getUser(id);
        res.status(200).json(user);
    } catch (error: any) {
        if (error.message === 'Invalid userid') {
            res.status(400).json({ message: 'Invalid userid' })
            } else if (error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' })
            } else {
            res.status(500).json({ error: error.message });
        }
    }
}

//create new user
export const createUser = async (req: Request, res:Response) => {
    const user = req.body;
    try {
        const result = await userService.createUser(user);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}


//update a user
export const updateUser = async (req:Request, res:Response) => {
    const id = parseInt(req.params.id);

    //update
    try {
        const user = req.body;
        const result = await userService.updateUser(id, user);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Invalid userid') {
            res.status(400).json({ message: 'Invalid userid' })
            } else if (error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' })
            } else {
            res.status(500).json({ error: error.message });
        }
    }
}


//delete a user
export const deleteUser = async (req:Request, res: Response) => {
    const id = parseInt(req.params.id);

    //delete
    try {
        const result = await userService.deleteUser(id);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Invalid userid') {
            res.status(400).json({ message: 'Invalid userid' })
            } else if (error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' })
            } else {
            res.status(500).json({ error: error.message });
        }


    }
}

// user login function 
export const loginUser=async(req:Request,res:Response)=>{
    try {
        const {email,password_hash}=req.body
        const result= await userService.loginUser(email,password_hash)
        res.status(200).json(result)
    } catch (error:any) {
        if(error.message=='User not found'){
            res.status(400).json({message:'User not found'})
        }else if (error.message=="Invalid Credentials"){
            res.status(404).json({message:'Invalid Credentilas'})
        }else{
            res.status(500).json({message:'Internal Server Error'})
        } 
        
    }
}