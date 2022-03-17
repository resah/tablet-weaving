import { Tablet } from './Tablet';
import { Thread } from './Thread';

describe('Tablet model', () => {

	test('should be initialized', () => {
	  const tablet = new Tablet(true, 4, [new Thread('#7722bb')]);
	
	  expect(tablet.sDirection).toEqual(true);
	  expect(tablet.holes).toEqual(4);
	  expect(tablet.threads.length).toEqual(1);
	});
	
	test('should be initialized from string', () => {
	  const tablet = Tablet.fromString('0#22dd44#ffaaee');
	
	  expect(tablet.sDirection).toEqual(false);
	  expect(tablet.holes).toEqual(4);
	  expect(tablet.threads.length).toEqual(2);
	  expect(tablet.threads[0].color).toEqual('#22dd44');
	  expect(tablet.threads[1].color).toEqual('#ffaaee');
	});
	
	test('should create string', () => {
	  const tablet = new Tablet(true, 4, [new Thread('#7722bb')]);
	
	  expect(tablet.toString()).toEqual('1#7722bb');
	});
});
