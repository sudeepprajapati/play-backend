import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(
    async (req, res) => {
        // get user details from frontend
        const { fullname, email, username, password } = req.body
        // console.log("email: ", email);

        // Regex for fullname validation
        const fullNameRegex = /^[a-zA-Z]{2,}(?: [a-zA-Z]+){1,}$/;
        // Regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex for strong password: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // validation - not empty
        if (
            [fullname, email, username, password].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required ");
        }

        // Check if fullname is valid
        if (!fullNameRegex.test(fullname)) {
            throw new ApiError(400, 'Full Name should contain at least two words (first name and last name).');
        }

        // Check if email is valid
        if (!emailRegex.test(email)) {
            throw new ApiError(400, 'Please enter a valid email address (e.g., example@domain.com).');
        }

        // Check if username is valid
        const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
        if (!usernameRegex.test(username)) {
            throw new ApiError(400, 'Username must be 3-15 characters long and can only contain letters, numbers, and underscores.');
        }

        // Check if password is strong
        if (!strongPasswordRegex.test(password)) {
            throw new ApiError(400, 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.');
        }
        // check if user already exits: username, email

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(409, "User with email or username already exist");
        }

        // check for images, check for avatar
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;
        let coverImageLocalPath;

        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        // upload from to cloudinary, avatar

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
        }

        // create user object - create entry in db
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        // remove password and refresh token field from
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        // check for user creation
        if (!createdUser) {
            throw new ApiError(500, "Somthing went wrong while registering the user");
        }
        // return response
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        )
    }
)

export { registerUser }