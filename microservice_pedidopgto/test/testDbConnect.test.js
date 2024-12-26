describe('Database Connection Tests', () => {
    let mongoose;
    const originalEnv = process.env;
    
    beforeEach(() => {
        jest.resetModules();
        mongoose = require('mongoose');
        process.env = {
            DOCDB_USERNAME: 'docdb_admin',
            DOCDB_PASSWORD: 'docdb_admin_password',
            DOCDB_CLUSTER_ENDPOINT_PED: 'mongodb_pedidopgto',
            DOCDB_DBNAME: 'orderdb'
        };
    });
 
    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });
 
    it('Deve conectar ao banco de dados com sucesso', async () => {
        const { connectToDatabase } = require('./testDbConnect');
        const connection = await connectToDatabase();
        expect(connection).toBeDefined();
        expect(connection.readyState).toBe(1);
        await connection.close();
    });
 
    it('Deve falhar ao conectar com variáveis de ambiente faltando', async () => {
        process.env.DOCDB_USERNAME = undefined;
        const { connectToDatabase } = require('./testDbConnect');
        await expect(connectToDatabase()).rejects.toThrow('Environment variables are not set correctly.');
    });
 
    it('Deve lidar com erro de conexão MongoDB', async () => {
        const mockConnect = jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('MongoDB Connection Error'));
        const { connectToDatabase } = require('./testDbConnect');
        await expect(connectToDatabase()).rejects.toThrow('MongoDB Connection Error');
        mockConnect.mockRestore();
    });
 
    it('Deve limpar o banco de dados com sucesso', async () => {
        const { connectToDatabase, clearDatabase, disconnectDatabase } = require('./testDbConnect');
        const connection = await connectToDatabase();
        await connection.createCollection('test_collection');
        await clearDatabase();
        const collections = await connection.db.collections();
        expect(collections).toHaveLength(0);
        await disconnectDatabase();
    });
 
    it('Deve lidar com erro ao limpar banco desconectado', async () => {
        const { clearDatabase } = require('./testDbConnect');
        jest.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
        await expect(clearDatabase()).rejects.toThrow('Database not connected');
    });
 
    it('Deve lidar com erro ao deletar coleções', async () => {
        const { connectToDatabase, clearDatabase } = require('./testDbConnect');
        await connectToDatabase();
        
        const mockCollection = {
            deleteMany: jest.fn().mockRejectedValue(new Error('Delete Error'))
        };
        
        jest.spyOn(mongoose.connection, 'collections', 'get').mockReturnValue({
            testCollection: mockCollection
        });
 
        await expect(clearDatabase()).rejects.toThrow('Delete Error');
    });
 
    it('Deve desconectar do banco com sucesso', async () => {
        const { connectToDatabase, disconnectDatabase } = require('./testDbConnect');
        const connection = await connectToDatabase();
        await disconnectDatabase();
        expect(connection.readyState).toBe(0);
    });
 
    it('Deve lidar com erro na desconexão', async () => {
        const { connectToDatabase, disconnectDatabase } = require('./testDbConnect');
        await connectToDatabase();
        jest.spyOn(mongoose.connection, 'close').mockRejectedValue(new Error('Disconnect Error'));
        await expect(disconnectDatabase()).rejects.toThrow('Disconnect Error');
    });
 
    it('Deve lidar com desconexão quando banco já está desconectado', async () => {
        const { disconnectDatabase } = require('./testDbConnect');
        jest.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
        await expect(disconnectDatabase()).resolves.not.toThrow();
    });
 
    it('Deve lidar com eventos de erro de conexão', async () => {
        const { connectToDatabase } = require('./testDbConnect');
        const connection = await connectToDatabase();
        connection.emit('error', new Error('Connection Error'));
        await connection.close();
    });
 });