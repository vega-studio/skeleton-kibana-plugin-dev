module.exports = function bigLog(...message) {
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log(new Array(25).fill(0).map(_ => '-').join(''));
  console.log.apply(null, message);
  console.log(new Array(25).fill(0).map(_ => '-').join(''));
  console.log('\n');
  console.log('\n');
  console.log('\n');
  console.log('\n');
}
