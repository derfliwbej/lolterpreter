import { Token } from "./Token.js";
export class Expr {
}
(function (Expr) {
    class Binary extends Expr {
        constructor(left, operator, right) {
            super();
            this.left = left;
            this.operator = operator;
            this.right = right;
        }
        interpret(mapper) {
            switch (this.operator.getType()) {
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
    Expr.Binary = Binary;
    class Unary extends Expr {
        constructor(operator, operand) {
            super();
            this.operator = operator;
            this.operand = operand;
        }
        interpret(mapper) { return mapper.interpretUnaryExpr(this); }
    }
    Expr.Unary = Unary;
    class Literal extends Expr {
        constructor(value) {
            super();
            this.value = value;
        }
        interpret(mapper) { return mapper.interpretLiteralExpr(this); }
    }
    Expr.Literal = Literal;
    class Typecast extends Expr {
        constructor(operand, type) {
            super();
            this.operand = operand;
            this.type = type;
        }
        interpret(mapper) { return mapper.interpretTypecastExpr(this); }
    }
    Expr.Typecast = Typecast;
    class Identifier extends Expr {
        constructor(name) {
            super();
            this.name = name;
        }
        interpret(mapper) { return mapper.interpretIdentifierExpr(this); }
    }
    Expr.Identifier = Identifier;
    class Infinite extends Expr {
        constructor(operator, operands) {
            super();
            this.operator = operator;
            this.operands = operands;
        }
        interpret(mapper) { return mapper.interpretInfiniteExpr(this); }
    }
    Expr.Infinite = Infinite;
})(Expr || (Expr = {}));
