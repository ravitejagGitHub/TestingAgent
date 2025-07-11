import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Testfile', () => {
  it('should log "Hello, world!" to the console', () => {
    let output = '';
    const originalLog = console.log;
    console.log = (msg?: any) => { output += msg; };
    require('./Testfile');
    console.log = originalLog;
    expect(output).to.equal('Hello, world!');
  });
});