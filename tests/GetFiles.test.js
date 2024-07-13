import { createFile, getFiles } from '../utils/Files.js'
test('Get Files', async () => {
    const data = await getFiles("./dataTest");
    expect(data).toEqual([{name:'File.txt', type:"file"}, { name: 'testing', type:"directory" }])
})


