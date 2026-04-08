// src/middleware/validate.middleware.js
import { ZodError } from 'zod';

// ---------------------------------------------------------------------------
// validate(schema) returns an Express middleware function.
// WHY return a function? So you can use it like:
//   router.post('/', validate(createMealLogSchema), createMealLog)
// The schema is "baked in" via closure — the middleware knows which
// schema to validate against without any extra configuration.
// This pattern is called a "middleware factory".
// ---------------------------------------------------------------------------
export const validate = (schema) => (req, res, next) => {
  try {
    // .parse() throws ZodError if validation fails
    // It also TRANSFORMS the data — e.g. coercing strings to numbers
    // where you defined z.coerce. The cleaned data replaces req.body.
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        // Map Zod's issue format into a clean array your frontend can use
        issues: err.issues.map(issue => ({
          field:   issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    next(err);
  }
};