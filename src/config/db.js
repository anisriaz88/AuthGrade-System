import mongoose from 'mongoose';
import dns from 'node:dns';

const forMongoose = globalThis;

if (!forMongoose.__mongoose) {
    forMongoose.__mongoose = {
        conn: null,
        promise: null,
    };
}

// Connects to MongoDB using Mongoose.

const connectDB = async () => {
    const mongoUri = (process.env.MONGO_URI || '').trim();
    
    if (!mongoUri) {
        throw new Error('MONGO_URI is not set');
    }
    
    const dnsServers = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
    
    // - DNS_SERVERS can be used to work around SRV lookup issues.

    if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
    }

    if (forMongoose.__mongoose.conn) {
        return forMongoose.__mongoose.conn;
    }

    if (!forMongoose.__mongoose.promise) {
        forMongoose.__mongoose.promise = mongoose.connect(mongoUri).then((connection) => connection.connection);
    }

    try {
        forMongoose.__mongoose.conn = await forMongoose.__mongoose.promise;
        console.log('MongoDB connected');
        return forMongoose.__mongoose.conn;
    } catch (error) {
        forMongoose.__mongoose.promise = null;

        const isSrvDnsFailure = error?.code === 'ECONNREFUSED' || error?.syscall === 'querySrv';

        if (isSrvDnsFailure && dnsServers.length === 0) {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
            forMongoose.__mongoose.promise = mongoose.connect(mongoUri).then((connection) => connection.connection);
            forMongoose.__mongoose.conn = await forMongoose.__mongoose.promise;
            console.log('MongoDB connected');
            return forMongoose.__mongoose.conn;
        }

        throw error;
    }
};

export default connectDB;