/* eslint-env mocha */

'use strict'

const feed = require('../src/feedToSearchAdapter')
const expect = require('chai').expect

describe('Feed Adapter', () => {
  describe('convert', () => {
    let validEpisode = {}
    beforeEach(function () {
      // runs before each test in this block
      validEpisode = {
        link: 'url',
        guid: 'http://title.html?var=1',
        title: 'Title',
        published: '2018-05-01',
        enclosure: {
          url: 'test.mp3'
        }
      }
    })

    it('should populate an error message when null data is passed', () => {
      let result = feed.convert(null)
      expect(result.errors).to.have.lengthOf(1)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should populate an error message when the wrong data type is passed', () => {
      let result = feed.convert('test')
      expect(result.errors).to.have.lengthOf(1)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should populate an error message when no episodes key is present', () => {
      let result = feed.convert({})
      expect(result.errors).to.have.lengthOf(1)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should return no updates when there are no episodes to load', () => {
      let result = feed.convert({
        episodes: []
      })
      expect(result.errors).to.have.lengthOf(0)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should return multiple validation errors when there are no required fields', () => {
      let result = feed.convert({
        episodes: [
          {}
        ]
      })
      expect(result.errors).to.have.lengthOf(4)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should return 1 result for each valid episode', () => {
      let result = feed.convert({
        episodes: [
          validEpisode,
          validEpisode
        ]
      })
      expect(result.errors).to.have.lengthOf(0)
      expect(result.updateFeed).to.have.lengthOf(2)
    })
    it('should return 1 errors when there are 1 missing required fields', () => {
      delete validEpisode.title
      let result = feed.convert({
        episodes: [
          validEpisode
        ]
      })
      expect(result.errors).to.have.lengthOf(1)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should return 1 when enclosure url is false', () => {
      validEpisode.enclosure.url = ''
      let result = feed.convert({
        episodes: [
          validEpisode
        ]
      })
      expect(result.errors).to.have.lengthOf(1)
      expect(result.updateFeed).to.have.lengthOf(0)
    })
    it('should return mixed results when some episodes fail', () => {
      let result = feed.convert({
        episodes: [
          validEpisode, // 0 errors
          {}, // 4 errors
          { title: 'Title', guid: '123' }// 2 errors
        ]
      })

      expect(result.errors).to.have.lengthOf(6)
      expect(result.updateFeed).to.have.lengthOf(1)
    })
    it('should strip non alphanumeric characters from the id', () => {
      let result = feed.convert({
        episodes: [ validEpisode ]
      })

      expect(result.errors).to.have.lengthOf(0)
      expect(result.updateFeed[0].id).to.equal('http_title_html_var_1')
    })
    it('should allow for optionally overriding the podcast title', () => {
      let result = feed.convert(
        { episodes: [ validEpisode ] },
        'myurl',
        'custom title'
      )

      expect(result.errors).to.have.lengthOf(0)
      expect(result.updateFeed[0].podcastTitle).to.equal('custom title')
    })
  })
})
