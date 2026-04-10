import mongoose from 'mongoose';
import dns from 'node:dns';

// Connects to MongoDB using Mongoose.
//
// - DNS_SERVERS: Comma-separated DNS servers for Node to use (helps when mongodb+srv SRV lookups fail)
//   Example: DNS_SERVERS=8.8.8.8,1.1.1.1
const connectDB = async () => {
    try {
        // If provided, force Node's DNS resolver to use these servers.
        // This can fix cases where `nslookup` works but Node's `querySrv` fails.
        const dnsServers = (process.env.DNS_SERVERS || '')

        if (dnsServers.length > 0) {
            dns.setServers(dnsServers);
        }

        // Sanitize common .env patterns like quotes: MONGO_URI='mongodb+srv://...'
        const mongoUri = (process.env.MONGO_URI || '')

        if (!mongoUri) {
            throw new Error('MONGO_URI is not set');
        }

        const connect = async () => mongoose.connect(mongoUri);

        try {
            await connect();
        } catch (error) {
            // On some networks, SRV DNS lookups for Atlas (mongodb+srv) fail with ECONNREFUSED.
            // If the user did not explicitly set DNS_SERVERS, retry once with public resolvers.
            const isSrvDnsFailure = (error?.code === 'ECONNREFUSED' || error?.syscall === 'querySrv');
            if (isSrvDnsFailure && dnsServers.length === 0) {
                dns.setServers(['8.8.8.8', '1.1.1.1']);
                await connect();
            } else {
                throw error;
            }
        }
        console.log('MongoDB connected');
    } catch (error) {
        console.log('Not connecting to MongoDB:', error?.message || error);
        if ((error?.code === 'ECONNREFUSED' || error?.syscall === 'querySrv') && !process.env.DNS_SERVERS) {
            console.log('Tip: DNS SRV lookup failed. Add DNS_SERVERS=8.8.8.8,1.1.1.1 to your .env (or use a non-SRV mongodb:// URI).');
        }
        process.exit(1);
    }
};

export default connectDB;