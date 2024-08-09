import mysqlConnection from 'mysql2/promise';

const propieties = {
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'biblioteca',
};

export const pool = mysqlConnection.createPool(propieties);