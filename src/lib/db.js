import Dexie from 'dexie';
// import "dexie-export-import";

const db = new Dexie('time-tracker');
//Solo se ponen los campos a indexar. Segun doc:
//A rule of thumb: Are you going to put your property in a where(‘…’) clause? If yes, index it, if not, dont.
//Large indexes will affect database performance and in extreme cases make it unstable.

db.version(1).stores({
    track: '++id,date_from,date_to,elapsed_time,elapsed_time_text,date',
});

db.version(2).stores({
    app_state: 'id,current_period',
    track: '++id,date_from,date_to,elapsed_time,elapsed_time_text,date,period',
});

// db.export = (options) => {
//     console.info(Dexie);
//     return Dexie.export(options);
// };

export default db;