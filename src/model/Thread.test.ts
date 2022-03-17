import { Thread } from './Thread';

describe('Thread model', () => {

	test('should be initialized', () => {
	  const thread = new Thread('#aa55bb');
	
	  expect(thread.color).toEqual('#aa55bb');
	});
	
	test('should be initialized from string', () => {
	  const thread = Thread.fromString('aa55bb');
	
	  expect(thread.color).toEqual('#aa55bb');
	});
	
	test('should create string', () => {
	  const thread = new Thread('#aa55bb');
	
	  expect(thread.toString()).toEqual('#aa55bb');
	});
});
