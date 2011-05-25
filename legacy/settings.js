this.web = {
    port: 6000,
    env: 'live',
    domain: 'www.sleeperbot.com'
};

this.stream = {
    port: 6100,
    domain: 'stream.sleeperbot.com'
};

this.mongo = {
    host: '127.0.0.1',
    port: 27017,
    options: {},
    dbname: 'sleeperbot'
};

this.session = {
    lifetime: 2592000 // 30 days  
};

this.email = {
    host: 'localhost',
    port: '25',
    domain: 'localhost',
    address: {
        noreply: 'noreply@sleeperbot.com',
        contact: 'admin@sleeperbot.com'
    }
};
