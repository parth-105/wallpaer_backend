import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { connectDatabase } from '../config/database.js';
import { AdminModel } from '../models/Admin.js';
async function main() {
    await connectDatabase();
    const rl = readline.createInterface({ input, output });
    const email = await rl.question('Admin email: ');
    const password = await rl.question('Admin password: ');
    rl.close();
    const existing = await AdminModel.findOne({ email }).exec();
    if (existing) {
        console.log('Admin already exists. Updating password.');
        existing.password = password;
        await existing.save();
    }
    else {
        await AdminModel.create({ email, password, role: 'admin' });
    }
    console.log(`Admin account ready for ${email}`);
    process.exit(0);
}
main().catch((error) => {
    console.error('Failed to create admin user', error);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map