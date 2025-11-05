// import packages 
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// import modules 
import *as userRepositories from '../Repositories/users.repository'
import { NewUser,UpdateUser,User } from '../Types/users.types'

// load env variables 
dotenv.config()

// reusable function to check if user exist 
const ensureUserExists = async (id: number) => {
    const user = await userRepositories.getUserById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

// get all users 
export const listUsers = async() => await userRepositories.getUsers();

// get users by id 
export const getUser =async(id:number)=>{
    if(isNaN(id)){
        throw new Error('Invalid User Id')
    }
    return await ensureUserExists(id)
}

// create user by Id and hash their password 
export const createUser = async(user:NewUser)=>{
    // check if email already exist 
    const exists = await userRepositories.emailExists(user.email);
    if(exists) throw new Error ('Email already exists')
    // hash pass b4 saving 
    if(user.password_hash){
        user.password_hash=await bcrypt.hash(user.password_hash,10)
        console.log('Hashed password',user.password_hash)
    }

    return await userRepositories.createUser(user)
}

// update user by Id 
export const updateUser=async(id:number,user:UpdateUser)=>{
    if(isNaN(id)){
        throw new Error('Invalid User Id')
    }
    await ensureUserExists(id);
    // hash pass on update
    if(user.password_hash){
        user.password_hash=await bcrypt.hash(user.password_hash,10)
        console.log('Hashed password',user.password_hash)
    }
    return await userRepositories.updateUser(id,user)
}

// delete user by Id 
export const deleteUser = async(id:number)=>{
    if(isNaN(id)){
        throw new Error('Invaid User Id')
    }
    await ensureUserExists(id);
    return await userRepositories.deleteUser(id)
}

// user log in funtion 
export const loginUser=async(email:string,password:string)=>{
    const user =await userRepositories.getUserByEmail(email)
    if(!user){
        throw new Error('User not found')
    }
    // compare is provide pass is same as hashed one in DB
    const isMatch = await bcrypt.compare(password,user.password_hash)
    if(!isMatch){
        throw new Error('Invalid Credentials')
    }
    // create jwt payload:used to generate token 
    const payLoad={
        sub:user.userid,
        first_name:user.first_name,
        last_name:user.last_name,
        role:user.role_user,
        exp:Math.floor(Date.now()/1000+60*60)
    }
    // generate token 
    const secret=process.env.JWT_SECRET as string
    if(!secret) throw new Error('JWT is not defined')
    // generated token can be used as as a digitila identity of user for only 1 hour 
    const token=jwt.sign(payLoad,secret)

    // return successful login 
    return{
        message: 'Login successfull',
        token,
        user:{ //helps you have record of logged in users 
            userid:user.userid,
            FN:user.first_name,
            LN:user.last_name,
            email:user.email,  
            role:user.role_user         
}
    }
}
