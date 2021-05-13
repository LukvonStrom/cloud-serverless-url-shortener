import { slugify } from "../lib/create/create-slug"

test('test for hash collisions with random input', () => {
    let output = []
    for (let i = 0; i < 1000; i++) {
        let url = `https://fruntke.tech/test/${i}`
        output.push(slugify(url))
    }
    let duplicates = output.some((el, i) => output.indexOf(el) !== i)
    expect(duplicates).toHaveLength(0);
})

test('test for hash collisions with same input', () => {
    let output = []
    for (let i = 0; i < 1000; i++) {
        let url = `https://fruntke.tech/test/`
        output.push(slugify(url))
    }
    let duplicates = output.some((el, i) => output.indexOf(el) !== i)
    expect(duplicates).toHaveLength(0);
})

test('test for invalid URLs', () => {
    assert.throws(() => slugify("protocol://wrong/uri"), "invalid URL")
})

test('test for slug length', () => {
    let slug = slugify('https://google.com')
    expect(slug).toHaveLength(5);
})