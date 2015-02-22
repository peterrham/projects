package log4j_project_test;

import org.apache.log4j.Logger;

public class Log4jTest {

	static Logger log = Logger.getLogger("foobar");
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("hello, world!");
		
		log.error("This is my error message.");
	}

}
