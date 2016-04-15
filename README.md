# Challenge Framework

1.  Decided to use Esprima



* [Design decisions](DESIGN.md)



Running the framework:

    npm install
    npm run serve


 - limitations; the must / must not recure 3 levels deep into 'body'
 - the structure only gives you 2 levels of structure to express containing elements at the root and their contents.
 - the must / must not requirements are not recursive
 - app.js shouldn't have the config. should load it from an external file or service.
