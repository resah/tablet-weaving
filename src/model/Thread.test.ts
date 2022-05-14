import { Thread } from './Thread';

describe('Thread model', () => {

	test('should be initialized', () => {
	  const thread = new Thread('#aa55bb');
	
	  expect(thread.color).toEqual('#aa55bb');
	});
	
	test('should be initialized from string', () => {
	  const thread = Thread.fromString('aa55bb');
	
	  expect(thread.color).toEqual('#aa55bb');
	  expect(thread.empty).toEqual(false);
	});
	
	test('should be initialized from string for pebble weave', () => {
	  const thread = Thread.fromString('XXXXXX');
	
	  expect(thread.color).toEqual('#FFFFFF');
	  expect(thread.empty).toEqual(true);
	});
	
	test('should create string', () => {
	  const thread = new Thread('#aa55bb');
	
	  expect(thread.toString()).toEqual('#aa55bb');
	});
	
	test('should create string for pebble weave', () => {
	  const thread = new Thread('#aa55bb', true);
	
	  expect(thread.toString()).toEqual('#XXXXXX');
	});
});
