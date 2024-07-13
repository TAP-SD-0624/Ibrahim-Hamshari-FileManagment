import { body, validationResult, query } from "express-validator";
import checkName from "./checkName.js";

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send({ errors: errors.array() })
    }
    next()
}
export const createFiles = [
    body("name", "Name is required").notEmpty().bail().isString().bail().isAlphanumeric(),
    body("type", "Type is required").notEmpty().bail().isString().bail().custom((value, { req }) => {
        if (value == "file") {
            if (req.body.data) {
                return true
            }
            else {
                return false;
            }
        }
        if (value == "dir") {
            return true;
        }
        return false;
    }),
    validate,
    checkName
]

export const updateFile = [
    body("name", "Name is required").notEmpty().bail().isString().bail().isAlphanumeric(),
    // body("type", "Type is required").notEmpty().bail().isString().bail().custom((value, { req }) => {
    //     if(value == "file" || value == "dir"){
    //         return true;
    //     }
    //     return false;
    //  }
    // ),
    validate,
    checkName
]

export const search = [
    query("name").optional().isString().bail().isAlphanumeric().toLowerCase(),
    query("ext").optional().isString().bail().isAlphanumeric().toLowerCase(),
    validate
]