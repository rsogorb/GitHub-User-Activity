const https = require('https');

const username = process.argv[2];

if (!username) {
    console.error('Por favor proporciona un nombre de usuario de GitHub.');
    process.exit(1);
}

const url = `https://api.github.com/users/${username}/events`;

const options = {
    headers: {
        'User-Agent': 'Node.js CLI',
        'Accept': 'application/vnd.github.v3+json'
    }
};

https.get(url, options, (res) => {
    let data = '';

    if(res.statusCode !== 200) {
        console.log(`Error al obtener datos: ${res.statusCode}`);
        res.resume();
        return;
    }

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try{
            const events = JSON.parse(data);
            if(events.length === 0) {
                console.log("No hay actividad reciente.");
                return;
            }

            events.forEach(event => {
                switch (event.type) {
                    case "PushEvent":
                        const commits = event.payload.commits || [];
                        console.log(`Pushed ${commits.length} commits to ${event.repo.name}`);
                        break;
                    case "IssuesEvent":
                        console.log(`${event.payload.action} an issue in ${event.repo.name}`);
                        break;
                    case "WatchEvent":
                        console.log(`Starred ${event.repo.name}`);
                        break;
                    case "ForkEvent":
                        console.log(`Forked ${event.repo.name}`);
                        break;
                    case "CreateEvent":
                        console.log(`Created ${event.payload.ref_type} in ${event.repo.name}`);
                        break;
                    default:
                        console.log(`${event.type} on ${event.repo.name}`);
                }
            });
        } catch (err) {
            console.error('Error al procesar la respuesta de GitHub:', err.message);
        }
    });
}).on('error', (err) => {
    console.error('Error de conexión:', err.message);
});