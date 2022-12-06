#include <iostream>
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <queue>
using namespace std;

const string suffix = ".huffman";
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
	// encode a file
	void encode(string file){
		reset();
		vector<string> lines;
		ifstream fin(file);
		string line;
		while(getline(fin, line)){
			line += '\n';
			lines.push_back(line);
			load(line);
		}
		generate();
		
		ofstream fout(file + suffix, ios_base::out | ios_base::binary);
		output(fout, true);
		
		int buffer = 0;
		int MAX = sizeof(buffer) * 8;
		int offset = MAX - 1;
		for(const string& s: lines){
			for(const char& ch: s){
				string code = dict[ch];
				for(int i = 0; i < code.length(); i ++){
					buffer += (code[i] - '0') << offset;
					offset --;
					if(offset < 0){
						fout.write((char*)&buffer, sizeof(buffer));
						buffer = 0;
						offset = MAX - 1;
					}
				}
			}
		}
		if(offset != MAX - 1){
			int bytes = (MAX - 1 - offset + 7) / 8;
			fout.write((char*)&buffer, bytes);
		}
	}
	void output(ostream& os, bool as_bit = false){
		if(as_bit){
			for(unordered_map<char, string>::iterator ii = dict.begin(); ii != dict.end(); ii ++){
				char ch = (*ii).first;
				os.write(&ch, 1);
				int len = (*ii).second.length();
				string code = (*ii).second;
				
				os.write((char* )&len, 4);
				
				char buffer = 0;
				int i = 0;
				int MAX = sizeof(buffer) * 8;
				int offset = MAX - 1;
				while(i < len){
					buffer += (code[i] - '0') << offset;
					i ++;
					offset --;
					if(offset < 0){
						os.write((char*)&buffer, sizeof(buffer));
						buffer = 0;
						offset = MAX - 1;
					}
				}
				if(offset != MAX - 1)
					os.write((char*)&buffer, sizeof(buffer));
			}
			char ch = '\0';
			os.write(&ch, 1);
		}
		else{
			for(unordered_map<char, string>::iterator ii = dict.begin(); ii != dict.end(); ii ++){
				os << *(leaf[(*ii).first]) << "         \t" << (*ii).second << endl;
			}	
		}
	}
	void output(string outfile, bool as_bit = false){
		ofstream fout(outfile);
		output(fout, as_bit);
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
	// load Huffman code from header
	void load(ifstream& fin){
		char ch;
		
		char buffer = 0;
		int MAX = sizeof(buffer) * 8;
		while(fin.read(&ch, 1) && (ch != '\0')){
			int len = 0;
			fin.read((char*)&len, 4);
			string code = "";
			int buffer_cnt = (len + MAX - 1) / MAX;
			int pos = 0;
			for(int i = 0; i < buffer_cnt; i ++){
				char buffer = 0;
				int offset = MAX - 1;
				fin.read((char*)&buffer, sizeof(buffer));
				while(pos < len && offset >= 0){
					int flag = (buffer >> offset) & 0x1;
					char ch = flag ? '1' : '0';
					code += ch;
					pos ++;
					offset --;
				}
			}
			root->insert(code, ch);
//			cout << ch << "\t" << len << "\t" << code << endl;
		}
	}
	// decode an encoded file
	void decode(string file){
		if(file.substr(file.size() - suffix.size()) != suffix)
			return;
		reset();
		ifstream fin(file, ios_base::in | ios_base::binary);
		load(fin);
		ofstream fout(file + ".decoded.txt");
		
		int buffer = 0;
		int MAX = sizeof(buffer) * 8;
		int offset = MAX - 1;
		fin.read((char*)&buffer, sizeof(buffer));
		
		string line = "";
		HuffmanNode* scan = root;
		while(1){
			int flag = (buffer >> offset) & 0x1;
			offset --;
			if(flag == 0)
				scan = scan->left;
			else
				scan = scan->right;
			if(scan->ch != 0){
				line += scan->ch;
				if(scan->ch == '\n'){
					fout << line;
					line = "";
				}
				scan = root;
			}
			if(offset < 0){
				if(!fin.read((char*)&buffer, sizeof(buffer)))
					break;
				offset = MAX - 1;
			}
		}
		if(!line.empty())
			fout << line;
	}
};
int main(){
	HuffmanEncoder encoder;
	encoder.encode_space = true;
	HuffmanDecoder decoder;
	
	string file = "orignal.txt";
	encoder.encode(file);
	
	string out_file = "table.txt";
	encoder.output(out_file);
	
	decoder.decode(file + ".huffman");
	
	encoder.reset();
	decoder.reset();
}
