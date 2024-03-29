
'use strict'

const assert = require('assert')
const equal = assert.strictEqual

function keysEqual(obj, keys) {
  assert.deepEqual(Object.keys(obj).sort(), keys.sort())
}

module.exports = Fetch => {

  describe('## fetch.io', () => {
    const jsonType = 'application/json'
    const host = 'http://httpbin.org'

    const request = new Fetch()

    it('invalid url', () => {
      let catched = false

      try {
        request.get()
      } catch (e) {
        catched = true
        equal(e.message, 'invalid url')
      }

      equal(catched, true)
    })

    describe('# query', () => {
      it('query()', () => {
        return request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          keysEqual((body.args), ['name', 'pass', 'type'])
        })
      })

      it('query() - merge url', () => {
        return request
        .get(host + '/get?name=haoxin')
        .query({
          pass: 123456
        })
        .query({
          type: 1
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          keysEqual(body.args, ['name', 'pass', 'type'])
        })
      })
    })

    describe('text()', () => {
      it('basic', () => {
        return request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .text()
        .then(text => {
          equal(typeof text, 'string')
          const body = JSON.parse(text)
          keysEqual(body.args, ['name', 'pass', 'type'])
        })
      })
    })

    describe('json()', () => {
      it('basic', () => {
        return request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .json()
        .then(body => {
          keysEqual(body.args, ['name', 'pass', 'type'])
        })
      })

      it('strict - not object (number, string)', () => {
        console.warn('TODO')
      })

      it('strict - null', () => {
        console.warn('TODO')
      })
    })

    describe('# send', () => {
      it('json', () => {
        return request
        .post(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          equal(body.headers['Content-Type'], jsonType)
          keysEqual(body.json, ['name', 'pass', 'type'])
        })
      })

      it('urlencoded', () => {
        return request
        .post(host + '/post')
        .send('name=haoxin')
        .send('pass=123456')
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          keysEqual(body.form, ['name', 'pass'])
        })
      })

      it.skip('get() should ignore body', () => {
        return request
        .get(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          console.log(body)
        })
      })
    })

    describe('# set', () => {
      it('set(key, value)', () => {
        return request
        .post(host + '/post')
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('x-fetch-io', 'hello')
        .send({
          name: 'haoxin'
        })
        .send({
          pass: 123456
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
        })
      })

      it('set(obj)', () => {
        return request
        .post(host + '/post')
        .set({
          'content-type': 'application/x-www-form-urlencoded',
          'x-fetch-io': 'hello'
        })
        .send({
          name: 'haoxin'
        })
        .send({
          pass: 123456
        })
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
        })
      })
    })

    describe('# append', () => {
      it('append(key, value)', () => {
        return request
        .post(host + '/post')
        .append('name', 'haoxin')
        .append('desc', 'hello world')
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          assert.ok(body.headers['Content-Type'].startsWith('multipart/form-data'))
          keysEqual(body.form, ['name', 'desc'])
          equal(body.form.name, 'haoxin')
          equal(body.form.desc, 'hello world')
        })
      })
    })

    describe('# prefix', () => {
      it('basic', () => {
        const req = new Fetch({
          prefix: host + '/get'
        })

        return req
        .get('')
        .then(res => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(body => {
          equal(body.url, host + '/get')
        })
      })
    })

    describe('# jsonHandler', () => {
      it('basic', () => {
        const req = new Fetch({
          jsonHandler: json => {
            json.meta = 'json handler'
          }
        })

        return req
        .get(host + '/get')
        .json()
        .then(json => {
          equal(json.meta, 'json handler')
        })
      })
    })
  })
}
