import { Context, Next } from 'koa';

/**
 * Helper function to validate an object against the provided schema,
 * and to throw a custom error if object is not valid.
 *
 * @param {Object} object The object to be validated.
 * @param {String} label The label to use in the error message.
 * @param {JoiSchema} schema The Joi schema to validate the object against.
 */
function validateObject(object = {}, label: string, schema: any, options?: any)
{
    // Skip validation if no schema is provided
    if (schema)
    {
        // Validate the object against the provided schema
        const { error, value } = schema.validate(object)
        if (error)
        {
            // Throw error with custom message if validation failed
            throw new Error(`Invalid ${label} - ${error.message}`)
        }
    }
}

/**
 * Generate a Koa middleware function to validate a request using
 * the provided validation objects.
 *
 * @param {Object} validationObj
 * @param {Object} validationObj.headers The request headers schema
 * @param {Object} validationObj.params The request params schema
 * @param {Object} validationObj.query The request query schema
 * @param {Object} validationObj.body The request body schema
 * @returns A validation middleware function.
 */
export function validate(validationObj: any, errorCallback?: (ctx: Context, error: Error) => any)
{
    // Return a Koa middleware function
    return (ctx: Context, next: Next) => {
        try
        {
            // Validate each request data object in the Koa context object
            validateObject(ctx.headers, 'Headers', validationObj.headers, { allowUnknown: true });
            validateObject(ctx.params, 'URL Parameters', validationObj.params)
            validateObject(ctx.query, 'URL Query', validationObj.query)

            if (ctx.request.body)
            {
                validateObject(ctx.request.body, 'Request Body', validationObj.body)
            }

            return next()
        }
        catch (err)
        {
            // If any of the objects fails validation, send an HTTP 400 response.
            if (errorCallback)
            {
                errorCallback(ctx, err);
            }
            else
            {
                ctx.throw(400, err.message);
            }
        }
    }
}