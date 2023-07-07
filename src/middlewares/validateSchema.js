
export default function validateSchema(schema) {
    return (req, res, next) => {

        let validationObj = req.body;
        if (req.params.tipo) validationObj = { ...req.body, tipo: req.params.tipo };

        const validation = schema.validate(validationObj, { abortEarly: false });
        if (validation.error) {
            const errors = validation.error.details.map(det => det.message);
            return res.status(422).send(errors);
        }

        next();
    }
}