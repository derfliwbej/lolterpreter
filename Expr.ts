import { Token } from "./Token.js";

export abstract class Expr {
    abstract interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type;
}

export namespace Expr {
    export class Binary extends Expr {
        left: Expr;
        operator: Token;
        right: Expr;
    
        constructor(left: Expr, operator: Token, right: Expr) {
            super();
            this.left = left;
            this.operator = operator;
            this.right = right;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type {
            switch(this.operator.getType()) {
                case Token.ADDITION_OPERATOR:
                case Token.SUBTRACTION_OPERATOR:
                case Token.MULTIPLICATION_OPERATOR:
                case Token.DIVISION_OPERATOR:
                case Token.MODULO_OPERATOR:
                case Token.MAX_OPERATOR:
                case Token.MIN_OPERATOR:
                    return mapper.interpretArithmeticBinaryExpr(this);
                case Token.AND_OPERATOR:
                case Token.OR_OPERATOR:
                case Token.XOR_OPERATOR:
                    return mapper.interpretLogicalBinaryExpr(this);
                case Token.EQUAL_OPERATOR:
                case Token.NOT_EQUAL_OPERATOR:
                    return mapper.interpretComparisonExpr(this);
            }
    
            return null;
        }
    
    }
    
    export class Unary extends Expr {
        operator: Token;
        operand: Expr;
    
        constructor(operator: Token, operand: Expr) {
            super();
            this.operator = operator;
            this.operand = operand;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type> ): Type { return mapper.interpretUnaryExpr(this); }
    }
    
    export class Literal extends Expr {
        value: any;
    
        constructor(value: any) {
            super();
            this.value = value;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type { return mapper.interpretLiteralExpr(this); }
    }
    
    export class Typecast extends Expr {
        operand: Expr;
        type: Token;
    
        constructor(operand: Expr, type: Token) {
            super();
            this.operand = operand;
            this.type = type;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type { return mapper.interpretTypecastExpr(this); }
    }
    
    export class Identifier extends Expr {
        name: Token;
    
        constructor(name: Token) {
            super();
            this.name = name;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type { return mapper.interpretIdentifierExpr(this); }
    }
    
    export class Infinite extends Expr {
        operator: Token;
        operands: Array<Expr>;
    
        constructor(operator: Token, operands: Array<Expr>) {
            super();
            this.operator = operator;
            this.operands = operands;
        }
    
        interpret<Type>(mapper: Expr.InterpretMapper<Type>): Type { return mapper.interpretInfiniteExpr(this); }
    }
    
    export interface InterpretMapper<Type> {
        interpretArithmeticBinaryExpr(expression: Binary): Type;
        interpretLogicalBinaryExpr(expression: Binary): Type;
        interpretComparisonExpr(expression: Binary): Type;
        interpretUnaryExpr(expression: Unary): Type;
        interpretLiteralExpr(expression: Literal): Type;
        interpretTypecastExpr(expression: Typecast): Type;
        interpretIdentifierExpr(expression: Identifier): Type;
        interpretInfiniteExpr(expression: Infinite): Type;
    }
}