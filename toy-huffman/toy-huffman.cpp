#include <iostream>
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <queue>
using namespace std;

// Huffman tree node
class HuffmanNode{
public:
	int freq;
	char ch;
	HuffmanNode* left;
	HuffmanNode* right;
	HuffmanNode(){}
	HuffmanNode(char ch): freq(0), ch(ch), left(NULL), right(NULL){}
	HuffmanNode(int leaf): freq(leaf), ch(0), left(NULL), right(NULL){}
	bool operator ++ (int){
		freq++;
	}
	bool operator < (const HuffmanNode& node) const{
		return freq > node.freq;
	}
	// insert a charactor's code into tree, used in decode
	void insert(string code, char ch){
		if(code.length() == 0)
			this->ch = ch;
		if(code[0] == '0'){
			if(!this->left)
				this->left = new HuffmanNode('\0');
			this->left->insert(code.substr(1), ch);
		}
		else if(code[0] == '1'){
			if(!this->right)
				this->right = new HuffmanNode('\0');
			this->right->insert(code.substr(1), ch);
		}
	}
	friend ostream& operator << (ostream&, HuffmanNode&);
};
ostream& operator << (ostream& os, HuffmanNode& node){
	os << node.ch << "\t" << node.freq;
	return os;
}
class Compare{
public:
	bool operator () (const HuffmanNode* p1, const HuffmanNode* p2){
		return *p1 < *p2;
	}
};
class HuffmanEncoder{
private:
	// Huffman tree leaf node, actual charactor
	unordered_map<char, HuffmanNode*> leaf;
	// Huffman encode
	unordered_map<char, string> dict;
	void construct_code(HuffmanNode* node, string code){
		if(!node->left && !node->right && node->ch != 0){
			dict[node->ch] = code;
			return;
		}
		HuffmanNode* left = node->left, *right = node->right;
		// release temporary alloced node to avoid memory leak
		delete node;
		construct_code(left, code + "0");
		construct_code(right, code + "1");
	}
	// release alloced leaf node to avoid memory leak
	void clear(){
		for(unordered_map<char, HuffmanNode*>::iterator ii = leaf.begin(); ii != leaf.end(); ii ++){
			delete (*ii).second;
		}
	}
public:
	// whether encoder will take space into considert 
	bool encode_space;
	
	HuffmanEncoder(){
		encode_space = false;
		leaf.clear();
		dict.clear();
	}
	~HuffmanEncoder(){
		clear();
	}
	void reset(){
		leaf.clear();
		dict.clear();
		clear();
	}
	void load(const string& s){
		for(const char& ch: s){
			if(ch == ' ' && !encode_space)
				continue;
			if(leaf.find(ch) == leaf.end())
				leaf[ch] = new HuffmanNode(ch);
			(*leaf[ch]) ++;
		}
	}
	// generate Huffman code
	void generate(){
		dict.clear();
		priority_queue<HuffmanNode*, vector<HuffmanNode*>, Compare> q;
		for(unordered_map<char, HuffmanNode*>::iterator ii = leaf.begin(); ii != leaf.end(); ii ++){
			q.push((*ii).second);
		}
		// greedy algorithm to construct Huffman tree
		while(q.size() > 1){
			HuffmanNode* node1 = q.top();
			q.pop();
			HuffmanNode* node2 = q.top();
			q.pop();
			HuffmanNode* node = new HuffmanNode(node1->freq + node2->freq);
			node->left = node1;
			node->right = node2;
			q.push(node);
		}
		// Huffman tree root
		HuffmanNode* root = q.top();
		q.pop();
		// backtrace from root to leaf and generate code
		construct_code(root, "");
		
		int origin = 0, compacted = 0;
		for(unordered_map<char, string>::iterator ii = dict.begin(); ii != dict.end(); ii ++){
			// origin ascii character take place 8 bits/1 byte
			origin += 8 * leaf[(*ii).first]->freq;
			// Huffman encode with changable length code
			compacted += (*ii).second.length() * leaf[(*ii).first]->freq;
		}
		cout << "Compact rate: " << (double)compacted / origin << endl;
	}
	// encode a string
	string encode(string s){
		string ret = "";
		for(const char& ch: s){
			if(dict.find(ch) == dict.end()){
				cout << "Error::charactor \'" << ch << "\' not included in input content..." << endl;
				continue;
			}
			ret += dict[ch];
		}
		return ret;
	}
	void output(ostream& os){
		for(unordered_map<char, string>::iterator ii = dict.begin(); ii != dict.end(); ii ++){
			os << *(leaf[(*ii).first]) << "         \t" << (*ii).second << endl;
		}
	}
	void output(string outfile){
		string out_file = "table.txt";
		ofstream fout(outfile);
		output(fout);
		fout.close();
	}
	void display_leaf(){
		for(unordered_map<char, HuffmanNode*>::iterator ii = leaf.begin(); ii != leaf.end(); ii ++){
			cout << (*ii).first << "\t" << (*ii).second->freq << endl;
		}
	}
};
class HuffmanDecoder{
private:
	HuffmanNode* root;
	// delete the Huffman dict tree recursively
	void clear(){
		queue<HuffmanNode*> q;
		q.push(root);
		while(!q.empty()){
			HuffmanNode* curr = q.front();
			q.pop();
			if(curr->left)
				q.push(curr->left);
			if(curr->right)
				q.push(curr->right);
			delete curr;
		}
	}
public:
	HuffmanDecoder(){
		root = new HuffmanNode('\0');
	}
	void reset(){
		clear();
		root = new HuffmanNode('\0');
	}
	// load Huffman code from a file
	void load(string file){
		reset();
		
		ifstream fin(file);
		string line;
		while(getline(fin, line)){
			char ch = line[0];
			line = line.substr(1);
			stringstream ss(line);
			int freq;
			string code;
			ss >> freq >> code;
			root->insert(code, ch);
		}
	}
	// decode an encoded string
	string decode(string s){
		string ret = "";
		int idx = 0, len = s.length();
		HuffmanNode* scan = root;
		while(idx < len){
			if(s[idx] == '0')
				scan = scan->left;
			else
				scan = scan->right;
			idx ++;
			if(scan->ch != 0){
				ret += scan->ch;
				scan = root;
			}
		}
		return ret;
	}
};
int main(){
	HuffmanEncoder encoder;
	encoder.encode_space = true;
	HuffmanDecoder decoder;
	
	string file = "orignal.txt";
	ifstream fin(file);
	string line;
	while(getline(fin, line)){
		encoder.load(line);
	}
	encoder.generate();
	string out_file = "table.txt";
	encoder.output(out_file);
	
	decoder.load(out_file);
	string s = "Mr. Jones, of the Manor Farm, had locked the hen-houses for the night, but \
was too drunk to remember to shut the pop-holes. With the ring of light \
from his lantern dancing from side to side, he lurched across the yard, \
kicked off his boots at the back door, drew himself a last glass of beer \
from the barrel in the scullery, and made his way up to bed, where \
Mrs. Jones was already snoring.";
	string encoded = encoder.encode(s);
	string decoded = decoder.decode(encoded);
	cout << decoded << endl << endl;
	if(decoded == s)
		cout << "Accepted" << endl;
	else
		cout << "Denied" << endl; 
	encoder.reset();
	decoder.reset();
}
