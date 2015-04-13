var PubMed = {
  search: function(term) {
    var resource = new Resource('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      db: 'pubmed',
      term: term,
      retmode: 'json'
    });

    return resource.get('json').then(function(response) {
      var result = response.esearchresult;

      if (!result.count) {
        return;
      }

      return result.idlist;
    });
  },
  summary: function(pmids) {
    var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

    var params = {
      db: 'pubmed',
      id: pmids.splice(0, 50).join(','),
      retmode: 'json',
    };

    var collection = new Collection(url, params);

    collection.items = function(response) {
      var result = response.result;

      return Object.keys(result).map(function(key) {
        return result[key];
      });
    };

    collection.next = function(response) {
      if (!pmids.length) {
        return;
      }

      params.id = pmids.splice(0, 50).join(',');

      return [url, params];
    };

    return collection.get('json');
  },
  links: function(pmid, linkname) {
    var params = {
      id: pmid,
      linkname: linkname,
      retmode: 'xml' // no JSON for ELink yet
    };

    var collection = new Collection('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi', params);

    collection.items = function(response) {
      var nodes = response.querySelectorAll('LinkSet > LinkSetDb > Link > Id');

      return Array.prototype.map.call(nodes, function(node) {
        return node.textContent;
      });
    };

    collection.next = function(response) {
      return null; // no pagination for ELink yet
    }

    return collection.get('document');
  }
};
