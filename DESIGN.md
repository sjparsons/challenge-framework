# Design decisions

|             | [Esprima](http://esprima.org/) | [Acorn](http://marijnhaverbeke.nl/acorn/)         |
| ----------- | ------------- | ------------- |
| **Performance** | Slightly better performance  |   |
| **Filesize** | 194 KB       | 123 KB  |
| **API Quality** | Returns ESTree       | Returns ESTree  |
| **Documentation** | More complete       | Minimal  |


Ultimately, on performance the two are quite closely matched, but Esprima seems to have a bigger development community behind it and seems to have better documentation and therefore I decided to use it.

## Esprima 2.7.2 (as of writing)

* Github stars: 3053 (12 April 2016)
* open issues: 17 (12 April 2016)
* open pull requests: 0
* closed pull requests: 548
* Part of the jquery project
* Supports IE8+ and other browsers plus other environments
* Claims to be high performance
* [compares favorably](http://esprima.org/test/compare.html)with, but not faster than acorn
* Documentation is fairly clean and straight forward.
* Uses a standardized ESTree syntax tree format
* has good test coverage (according to docs)

## Acorn 3.0.4

* Github stars: 1560 (12 April 2016)
* Open issues: 8
* Open PR's: 1
* Closed PR's: 153
* sparse webpage and documentation
* returns same ESTree syntax as esprima
* supports browsers > IE5 and other major browsers


---

### Performance comparisons

Both libraries have performance comparisons out of the box.

Esprima's page compares num of milliseconds to parse the source of jQuery, AngularJS and React for each of a series of libraries. It performs the parse multiple times and returns a confidence interval.

| Library | Esprima | Acorn 2.4.0 |
| --
| jQuery.Mobile 1.4.2 | 133.4 ±10.3% |143.9 ±15.2% |
| Angular 1.2.5 | 116.0 ±8.3% | 100.2 ±6.8% |
| React 0.13.3 | 134.0 ±6.6% | 133.7 ±10.9% |

Here the two libraries seem pretty close in performance.

Acorn's page compares number of lines per second. In my experience it seems to vary quite a lot. Below is a table of my results running the tests *with location date*.

| Run | Esprima | Acorn |
| ----
| 1    |  199974 l/sec     | 156798 l/sec |
| 2    |  191558 l/sec     | 130798 l/sec |
| 3    |  230516 l/sec     | 226164 l/sec |
| 4    |  207352 l/sec     | 218374 l/sec |
| 5    |  197595 l/sec     | 195218 l/sec |
| 6    |  198172 l/sec     | 177961 l/sec |
| 7    |  207920 l/sec     | 184023 l/sec |
| 8    |  160657 l/sec     | 68783 l/sec |
| 9    |  170025 l/sec     | 79415 l/sec |
| 10   |  187174 l/sec     | 85695 l/sec |
| **AVG**   | 195094.3  l/sec  | 152322.9 l/sec |

As you can see, across these set of tests Esprima outperformed Acorn considerably.

### Conclusion

Esprima seems to maybe have a slight edge over Acorn as far as performance. Historically, it seems that Acorn was faster, but perhaps recent changes have helped make Esprima faster.
