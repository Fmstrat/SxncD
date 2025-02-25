export function logRequest(app) {
    app.use((req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            res.body = body; // Store the response body for logging
            return originalSend.apply(res, arguments); // Proceed with sending the response
        };
        res.on("finish", () => {
            if (res.statusCode != 200) {
                let body;
                try {
                    body = JSON.parse(res.body);
                } catch (e) {
                    body = {};
                }
                if (body?.error) {
                    console.log(`${req.method} - ${res.statusCode} - ${req.url} - ERROR: ${body.error}`);
                    return;
                }
            }
            console.log(`${req.method} - ${res.statusCode} - ${req.url}`);
        });
        next();
    });
}