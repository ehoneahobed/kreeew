import bcrypt from "bcryptjs"
import { clsx, type ClassValue } from "clsx"
import jwt, { JsonWebTokenError, JwtPayload, SignOptions } from "jsonwebtoken"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The function `saltAndHash` asynchronously generates a salt and hashes a password using bcrypt in
 * TypeScript.
 * @param {string} password - The `saltAndHash` function takes a `password` parameter of type string.
 * This function asynchronously generates a salt using `bcrypt.genSalt` and then hashes the password
 * using `bcrypt.hash`. Finally, it returns the hashed password as a string.
 * @returns The `saltAndHash` function returns a Promise that resolves to a hashed password string.
 */
export async function saltAndHash(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    throw new Error("Failed to hash password", { cause: error })
  }
}

/**
 * The function `verifyPassword` compares a password with its hash using bcrypt and returns a boolean
 * indicating if they match.
 * @param {string} password - The `password` parameter is a string that represents the user's input
 * password that needs to be verified.
 * @param {string} hash - The `hash` parameter in the `verifyPassword` function is typically a hashed
 * version of a password. It is the result of applying a cryptographic hash function to the original
 * password. This hashed password is stored securely in a database or elsewhere for verification
 * purposes. When a user attempts to log in, their
 * @returns The `verifyPassword` function returns a Promise that resolves to a boolean value indicating
 * whether the provided password matches the given hash.
 */
export async function verifyPassword({
  password,
  hash,
}: {
  password: string
  hash: string
}): Promise<boolean> {
  try {
    const result = await bcrypt.compare(password, hash)
    return result
  } catch (error) {
    throw new Error("Failed to verify password", { cause: error })
  }
}

type JWTTokenProps = {
  email?: string
  userId?: string
}

/**
 * The function generates a JWT token with a specified role and email, using a secret key and setting
 * an expiration time of 1 hour.
 * @param {JWTTokenProps}  - The `generateToken` function takes in an object with two properties:
 * `email`. It then generates a JSON Web Token (JWT) using the `jwt.sign` method with the
 * provided `email` values, along with a secret key (`JWT_SECRET`)
 * @returns The function `generateToken` is returning a JSON Web Token (JWT) that is generated using
 * the `jwt.sign` method with the provided `email` parameters, along with a `JWT_SECRET` and
 * an expiration time of 1 hour.
 */
export function generateToken(
  options: JWTTokenProps,
  expiresIn: SignOptions["expiresIn"] = "24h"
): string {
  const token = jwt.sign(options, process.env.JWT_SECRET!, {
    expiresIn,
  })
  return token
}

interface TokenVerificationResult {
  valid: boolean
  expired: boolean
  decoded?: string | JwtPayload
}

/**
 * The function `verifyToken` verifies a token using a secret key and returns a result indicating if
 * the token is valid, expired, or invalid.
 * @param {string} token - The `token` parameter is a string that represents a JSON Web Token (JWT)
 * that needs to be verified for its validity and expiration status. The `verifyToken` function takes
 * this token as input and uses the `jwt.verify` method to decode and verify the token using a secret
 * key (`JWT
 * @returns The `verifyToken` function returns a `TokenVerificationResult` object. This object contains
 * information about the verification result, including whether the token is valid, expired, and the
 * decoded token data if it is valid.
 */
export function verifyToken(token: string): TokenVerificationResult {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return { valid: true, expired: false, decoded }
  } catch (error) {
    if (
      error instanceof JsonWebTokenError &&
      error.name === "TokenExpiredError"
    ) {
      return { valid: false, expired: true }
    } else {
      return { valid: false, expired: false }
    }
  }
}
