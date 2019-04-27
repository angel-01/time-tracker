import Dexie from 'dexie';

const db = new Dexie('time-tracker');
//Solo se ponen los campos a indexar. Segun doc:
//A rule of thumb: Are you going to put your property in a where(‘…’) clause? If yes, index it, if not, dont.
//Large indexes will affect database performance and in extreme cases make it unstable.
db.version(1).stores({
    track: '++id,date_from,date_to,elapsed_time,elapsed_time_text,date',
});

export default db;