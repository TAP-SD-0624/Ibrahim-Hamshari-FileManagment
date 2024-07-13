export default (req, res, next) => {
        const name = req.body.name;
        const type = req.body.type;
        if (type == "file") {
            if (name.endsWith(".txt")) {
                next();
                return;
            }
            req.body.name = name + ".txt";
            next()
            return;
        }
        next();
}