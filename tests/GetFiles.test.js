import { createFile, getFiles } from '../utils/Files.js'
test('Get Files', async () => {
    const data = await getFiles("../dataTest");
    console.log(data);
    expect(data).toEqual([{name:'File.txt', type:"file"}, { name: 'testing', type:"directory" }])
})

test('Get Files x2', async () => {
    const data = await getFiles("../dataTest/testing");
    console.log(data);
    expect(data).toEqual([{name:'2.txt', type:"file"}])
})


